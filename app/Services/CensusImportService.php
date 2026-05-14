<?php

namespace App\Services;

use App\Models\Barangay;
use App\Models\Household;
use App\Models\Purok;
use App\Models\Resident;
use App\Models\ResidentImportError;
use App\Models\ResidentImportLog;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as SpreadsheetDate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CensusImportService
{
    /** @var list<string> */
    public const CANONICAL_COLUMNS = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'birth_date',
        'gender',
        'purok',
        'household_code',
        'civil_status',
        'voter_status',
        'occupation',
        'contact_number',
    ];

    /**
     * Store uploaded file under storage/app/imports and return relative path (for Storage).
     */
    public function storeUploadedFile(UploadedFile $file): string
    {
        return $file->store('imports', ['disk' => 'local']);
    }

    /**
     * Parse CSV or Excel into normalized associative rows. Each item: ['row' => int, 'data' => array<string, mixed>].
     *
     * @return array{rows: list<array{row: int, data: array<string, mixed>}>, headers: list<string>}
     */
    public function parseStoredFile(string $storagePath): array
    {
        $disk = Storage::disk('local');
        if (! $disk->exists($storagePath)) {
            throw new \InvalidArgumentException('Import file is missing.');
        }

        $absolute = $disk->path($storagePath);
        $ext = strtolower(pathinfo($storagePath, PATHINFO_EXTENSION));

        return match ($ext) {
            'csv' => $this->parseCsvFile($absolute),
            'xlsx', 'xls' => $this->parseSpreadsheetFile($absolute),
            default => throw new \InvalidArgumentException('Unsupported file type. Use CSV or Excel.'),
        };
    }

    /**
     * Map headers to canonical keys; apply aliases (case/spacing insensitive).
     *
     * @param  list<mixed>  $headerRow
     * @return array<int, string|null> column index => canonical key or null to skip
     */
    public function mapColumnNames(array $headerRow): array
    {
        $aliases = $this->headerAliases();
        $map = [];

        foreach ($headerRow as $i => $cell) {
            $normalized = $this->normalizeHeaderLabel((string) $cell);
            if ($normalized === '') {
                $map[$i] = null;

                continue;
            }

            $canonical = $aliases[$normalized] ?? null;
            $map[$i] = $canonical;
        }

        return $map;
    }

    /**
     * Validate parsed rows for a barangay context (no DB writes).
     *
     * @param  list<array{row: int, data: array<string, mixed>}>  $parsedRows
     * @return array{
     *     row_errors: array<int, list<string>>,
     *     duplicate_row_numbers: list<int>,
     *     duplicate_with_existing_ids: array<int, int>,
     * }
     */
    public function validateImport(Barangay $barangay, array $parsedRows): array
    {
        $rowErrors = [];
        $dupRows = [];
        $dupExisting = [];

        $seenKeys = [];

        foreach ($parsedRows as $item) {
            $rowNum = $item['row'];
            $data = $item['data'];
            $messages = $this->validateRowData($barangay, $data, strictPurok: true);
            if ($messages !== []) {
                $rowErrors[$rowNum] = $messages;
            }

            $key = $this->duplicateSignatureKey($barangay->id, $data);
            if ($key !== null) {
                if (isset($seenKeys[$key])) {
                    $dupRows[] = $rowNum;
                }
                $seenKeys[$key] = true;
            }
        }

        foreach ($parsedRows as $item) {
            $rowNum = $item['row'];
            $data = $item['data'];
            if ($this->duplicateSignatureKey($barangay->id, $data) === null) {
                continue;
            }
            $existing = $this->findDuplicateResident($barangay, $data);
            if ($existing !== null) {
                $dupExisting[$rowNum] = $existing->id;
            }
        }

        return [
            'row_errors' => $rowErrors,
            'duplicate_row_numbers' => array_values(array_unique($dupRows)),
            'duplicate_with_existing_ids' => $dupExisting,
        ];
    }

    /**
     * Same duplicate rules as validateImport but callable independently.
     *
     * @param  list<array{row: int, data: array<string, mixed>}>  $parsedRows
     * @return array{in_file: list<int>, in_database: array<int, int>}
     */
    public function detectDuplicates(Barangay $barangay, array $parsedRows): array
    {
        $validation = $this->validateImport($barangay, $parsedRows);

        return [
            'in_file' => $validation['duplicate_row_numbers'],
            'in_database' => $validation['duplicate_with_existing_ids'],
        ];
    }

    /**
     * Find or create a household for the barangay / purok / code combination.
     *
     * @param  array<string, mixed>  $attributes  Optional address, monthly_income, housing_type
     */
    public function createHouseholdIfMissing(
        Barangay $barangay,
        Purok $purok,
        string $householdCode,
        array $attributes = [],
    ): Household {
        if ($purok->barangay_id !== $barangay->id) {
            throw new \InvalidArgumentException('Purok does not belong to this barangay.');
        }

        $code = trim($householdCode);

        return Household::query()->firstOrCreate(
            [
                'barangay_id' => $barangay->id,
                'household_code' => $code,
            ],
            [
                'purok_id' => $purok->id,
                'address' => $attributes['address'] ?? null,
                'monthly_income' => $attributes['monthly_income'] ?? null,
                'housing_type' => $attributes['housing_type'] ?? null,
                'is_active' => true,
            ]
        );
    }

    /**
     * Persist residents from a staged import log; invalid rows are recorded and skipped (import continues).
     */
    public function processImport(ResidentImportLog $log): void
    {
        if ($log->storage_path === null || $log->storage_path === '') {
            throw new \InvalidArgumentException('Import has no stored file.');
        }

        $barangay = $log->barangay()->firstOrFail();

        $log->update([
            'status' => ResidentImportLog::STATUS_PROCESSING,
            'successful_imports' => 0,
            'failed_imports' => 0,
        ]);

        ResidentImportError::query()->where('import_log_id', $log->id)->delete();

        ['rows' => $parsedRows] = $this->parseStoredFile($log->storage_path);

        $success = 0;
        $failed = 0;

        foreach ($parsedRows as $item) {
            $rowNum = $item['row'];
            $data = $item['data'];

            try {
                $this->importSingleRow($barangay, $rowNum, $data);
                $success++;
            } catch (\Throwable $e) {
                $failed++;
                ResidentImportError::query()->create([
                    'import_log_id' => $log->id,
                    'row_number' => $rowNum,
                    'error_message' => $e->getMessage(),
                    'raw_data' => $data,
                ]);
            }
        }

        $log->update([
            'status' => ResidentImportLog::STATUS_COMPLETED,
            'successful_imports' => $success,
            'failed_imports' => $failed,
            'total_rows' => count($parsedRows),
        ]);

        if ($log->storage_path && Storage::disk('local')->exists($log->storage_path)) {
            Storage::disk('local')->delete($log->storage_path);
        }
        $log->update(['storage_path' => null]);
    }

    /**
     * CSV of failed rows for an import log.
     */
    public function generateImportReport(ResidentImportLog $log): StreamedResponse
    {
        $filename = 'resident-import-errors-'.$log->id.'.csv';

        return response()->streamDownload(function () use ($log): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }
            fputcsv($out, ['row_number', 'error_message', 'raw_data']);

            $log->errors()->orderBy('row_number')->chunk(500, function ($chunk) use ($out): void {
                foreach ($chunk as $error) {
                    /** @var ResidentImportError $error */
                    fputcsv($out, [
                        $error->row_number,
                        $error->error_message,
                        json_encode($error->raw_data ?? [], JSON_UNESCAPED_UNICODE),
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function importSingleRow(Barangay $barangay, int $rowNum, array $data): void
    {
        $messages = $this->validateRowData($barangay, $data, strictPurok: true);
        if ($messages !== []) {
            throw new \RuntimeException(implode(' ', $messages));
        }

        $birth = $this->parseBirthDate($data['birth_date'] ?? null);
        if ($birth === null) {
            throw new \RuntimeException('Invalid birth date.');
        }

        $purok = $this->resolvePurok($barangay, (string) $data['purok']);
        if ($purok === null) {
            throw new \RuntimeException('Unknown purok for this barangay.');
        }

        if ($this->findDuplicateResident($barangay, $data) !== null) {
            throw new \RuntimeException('Duplicate resident (same name and birth date in this barangay).');
        }

        $age = $birth->age;

        $householdId = null;
        $householdCode = trim((string) ($data['household_code'] ?? ''));
        if ($householdCode !== '') {
            $household = Household::query()
                ->where('barangay_id', $barangay->id)
                ->where('household_code', $householdCode)
                ->first();

            if ($household !== null) {
                if ((int) $household->purok_id !== (int) $purok->id) {
                    throw new \RuntimeException('Household code exists under a different purok.');
                }
                $householdId = $household->id;
            } else {
                $created = $this->createHouseholdIfMissing($barangay, $purok, $householdCode);
                $householdId = $created->id;
            }
        }

        DB::transaction(function () use (
            $barangay,
            $purok,
            $householdId,
            $data,
            $birth,
            $age,
        ): void {
            Resident::query()->create([
                'barangay_id' => $barangay->id,
                'purok_id' => $purok->id,
                'household_id' => $householdId,
                'first_name' => trim((string) $data['first_name']),
                'middle_name' => $this->optionalString($data['middle_name'] ?? null),
                'last_name' => trim((string) $data['last_name']),
                'suffix' => $this->optionalString($data['suffix'] ?? null),
                'birth_date' => $birth->toDateString(),
                'age' => max(0, $age),
                'gender' => $this->normalizeGender((string) $data['gender']),
                'civil_status' => trim((string) $data['civil_status']),
                'nationality' => 'Filipino',
                'contact_number' => $this->optionalString($data['contact_number'] ?? null),
                'email' => null,
                'occupation' => $this->optionalString($data['occupation'] ?? null),
                'educational_attainment' => null,
                'voter_status' => $this->parseBool($data['voter_status'] ?? false),
                'senior_citizen' => $age >= 60,
                'pwd_status' => false,
                'profile_photo' => null,
                'status' => Resident::STATUS_ACTIVE,
                'remarks' => null,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<string>
     */
    protected function validateRowData(Barangay $barangay, array $data, bool $strictPurok): array
    {
        $errors = [];

        if (trim((string) ($data['first_name'] ?? '')) === '') {
            $errors[] = 'First name is required.';
        }
        if (trim((string) ($data['last_name'] ?? '')) === '') {
            $errors[] = 'Last name is required.';
        }

        $birth = $this->parseBirthDate($data['birth_date'] ?? null);
        if ($birth === null) {
            $errors[] = 'Valid birth date is required.';
        }

        if (trim((string) ($data['gender'] ?? '')) === '') {
            $errors[] = 'Gender is required.';
        }

        if (trim((string) ($data['civil_status'] ?? '')) === '') {
            $errors[] = 'Civil status is required.';
        }

        $purokCell = trim((string) ($data['purok'] ?? ''));
        if ($purokCell === '') {
            $errors[] = 'Purok is required.';
        } elseif ($strictPurok && $this->resolvePurok($barangay, $purokCell) === null) {
            $errors[] = 'Purok does not match any record for this barangay.';
        }

        return $errors;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function findDuplicateResident(Barangay $barangay, array $data): ?Resident
    {
        $birth = $this->parseBirthDate($data['birth_date'] ?? null);
        if ($birth === null) {
            return null;
        }

        $fn = mb_strtolower(trim((string) ($data['first_name'] ?? '')));
        $mn = mb_strtolower(trim((string) ($data['middle_name'] ?? '')));
        $ln = mb_strtolower(trim((string) ($data['last_name'] ?? '')));
        $sx = mb_strtolower(trim((string) ($data['suffix'] ?? '')));

        return Resident::query()
            ->where('barangay_id', $barangay->id)
            ->whereDate('birth_date', $birth->toDateString())
            ->whereRaw('LOWER(TRIM(first_name)) = ?', [$fn])
            ->whereRaw('LOWER(TRIM(COALESCE(middle_name, \'\'))) = ?', [$mn])
            ->whereRaw('LOWER(TRIM(last_name)) = ?', [$ln])
            ->whereRaw('LOWER(TRIM(COALESCE(suffix, \'\'))) = ?', [$sx])
            ->first();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function duplicateSignatureKey(int $barangayId, array $data): ?string
    {
        $birth = $this->parseBirthDate($data['birth_date'] ?? null);
        if ($birth === null) {
            return null;
        }

        $parts = [
            $barangayId,
            mb_strtolower(trim((string) ($data['first_name'] ?? ''))),
            mb_strtolower(trim((string) ($data['middle_name'] ?? ''))),
            mb_strtolower(trim((string) ($data['last_name'] ?? ''))),
            mb_strtolower(trim((string) ($data['suffix'] ?? ''))),
            $birth->toDateString(),
        ];

        return implode('|', $parts);
    }

    protected function resolvePurok(Barangay $barangay, string $purokCell): ?Purok
    {
        $needle = mb_strtolower(trim($purokCell));
        if ($needle === '') {
            return null;
        }

        return Purok::query()
            ->where('barangay_id', $barangay->id)
            ->where(function ($q) use ($needle): void {
                $q->whereRaw('LOWER(TRIM(name)) = ?', [$needle])
                    ->orWhereRaw('LOWER(TRIM(COALESCE(code, \'\'))) = ?', [$needle]);
            })
            ->first();
    }

    protected function normalizeGender(string $gender): string
    {
        $g = mb_strtolower(trim($gender));
        $g = match ($g) {
            'm', 'male', 'man' => 'Male',
            'f', 'female', 'woman' => 'Female',
            default => ucfirst($g),
        };

        return $g;
    }

    protected function parseBool(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        $s = mb_strtolower(trim((string) $value));

        return in_array($s, ['1', 'true', 'yes', 'y', 'registered', 'voter', 'approved'], true);
    }

    protected function optionalString(mixed $value): ?string
    {
        $s = trim((string) $value);

        return $s === '' ? null : $s;
    }

    protected function normalizeHeaderLabel(string $header): string
    {
        $s = mb_strtolower(trim($header));
        $s = str_replace([' ', '-', '.'], '_', $s);

        return preg_replace('/_+/', '_', $s) ?? $s;
    }

    /**
     * @return array<string, string> normalized alias => canonical column key
     */
    protected function headerAliases(): array
    {
        $map = [];
        $pairs = [
            'first_name' => ['first_name', 'firstname', 'given_name', 'given name'],
            'middle_name' => ['middle_name', 'middlename', 'middle_initial', 'mi'],
            'last_name' => ['last_name', 'lastname', 'family_name', 'surname'],
            'suffix' => ['suffix', 'suffix_jr_sr'],
            'birth_date' => ['birth_date', 'birthdate', 'date_of_birth', 'dob', 'birthday'],
            'gender' => ['gender', 'sex'],
            'purok' => ['purok', 'purok_name', 'purok_code', 'sitio'],
            'household_code' => ['household_code', 'household', 'hh_code', 'family_code'],
            'civil_status' => ['civil_status', 'civilstatus', 'marital_status'],
            'voter_status' => ['voter_status', 'voter', 'registered_voter'],
            'occupation' => ['occupation', 'job'],
            'contact_number' => ['contact_number', 'contact', 'mobile', 'phone', 'cellphone'],
        ];

        foreach ($pairs as $canonical => $aliases) {
            foreach ($aliases as $alias) {
                $map[$this->normalizeHeaderLabel($alias)] = $canonical;
            }
        }

        return $map;
    }

    /**
     * @return array{rows: list<array{row: int, data: array<string, mixed>}>, headers: list<string>}
     */
    protected function parseCsvFile(string $absolutePath): array
    {
        $handle = fopen($absolutePath, 'rb');
        if ($handle === false) {
            throw new \RuntimeException('Unable to read CSV file.');
        }

        try {
            $bom = fread($handle, 3);
            if ($bom !== "\xEF\xBB\xBF") {
                rewind($handle);
            }

            $headerLine = fgetcsv($handle);
            if ($headerLine === false) {
                return ['rows' => [], 'headers' => []];
            }

            $columnMap = $this->mapColumnNames($headerLine);
            $rows = [];
            $line = 1;

            while (($cells = fgetcsv($handle)) !== false) {
                $line++;
                if ($this->rowIsEmpty($cells)) {
                    continue;
                }

                $assoc = [];
                foreach ($cells as $i => $cell) {
                    $key = $columnMap[$i] ?? null;
                    if ($key !== null && $key !== '') {
                        $assoc[$key] = $cell;
                    }
                }

                $rows[] = ['row' => $line, 'data' => $this->fillMissingColumns($assoc)];
            }

            return ['rows' => $rows, 'headers' => array_map(fn ($h) => (string) $h, $headerLine)];
        } finally {
            fclose($handle);
        }
    }

    /**
     * @return array{rows: list<array{row: int, data: array<string, mixed>}>, headers: list<string>}
     */
    protected function parseSpreadsheetFile(string $absolutePath): array
    {
        $spreadsheet = IOFactory::load($absolutePath);
        $sheet = $spreadsheet->getActiveSheet();
        $grid = $sheet->toArray(null, true, true, false);

        if ($grid === []) {
            return ['rows' => [], 'headers' => []];
        }

        $headerRow = array_shift($grid);
        /** @var list<mixed> $headerRow */
        $columnMap = $this->mapColumnNames($headerRow);

        $rows = [];
        $rowNum = 1;

        foreach ($grid as $cells) {
            $rowNum++;
            /** @var list<mixed> $cells */
            if (! is_array($cells) || $this->rowIsEmpty($cells)) {
                continue;
            }

            $assoc = [];
            foreach ($cells as $i => $cell) {
                $key = $columnMap[$i] ?? null;
                if ($key === null || $key === '') {
                    continue;
                }

                $coerced = $cell;
                if (is_numeric($cell) && in_array($key, ['birth_date'], true)) {
                    try {
                        $dt = SpreadsheetDate::excelToDateTimeObject((float) $cell);
                        $coerced = $dt->format('Y-m-d');
                    } catch (\Throwable) {
                        $coerced = $cell;
                    }
                }

                $assoc[$key] = $coerced;
            }

            $rows[] = ['row' => $rowNum, 'data' => $this->fillMissingColumns($assoc)];
        }

        return ['rows' => $rows, 'headers' => array_map(fn ($h) => (string) $h, $headerRow)];
    }

    /**
     * @param  array<string, mixed>  $assoc
     * @return array<string, mixed>
     */
    protected function fillMissingColumns(array $assoc): array
    {
        $out = [];
        foreach (self::CANONICAL_COLUMNS as $col) {
            $out[$col] = $assoc[$col] ?? null;
        }

        return $out;
    }

    /**
     * @param  list<mixed>  $cells
     */
    protected function rowIsEmpty(array $cells): bool
    {
        foreach ($cells as $c) {
            if ($c !== null && trim((string) $c) !== '') {
                return false;
            }
        }

        return true;
    }

    protected function parseBirthDate(mixed $value): ?CarbonInterface
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof CarbonInterface) {
            return Carbon::parse($value->format('Y-m-d'));
        }

        if (is_numeric($value)) {
            try {
                $dt = SpreadsheetDate::excelToDateTimeObject((float) $value);

                return Carbon::parse($dt->format('Y-m-d'));
            } catch (\Throwable) {
                // fall through
            }
        }

        $str = trim((string) $value);

        foreach (['Y-m-d', 'm/d/Y', 'd/m/Y', 'm-d-Y', 'd-m-Y'] as $fmt) {
            try {
                $parsed = Carbon::createFromFormat($fmt, $str);
                if ($parsed !== false) {
                    return $parsed->startOfDay();
                }
            } catch (\Throwable) {
                continue;
            }
        }

        try {
            return Carbon::parse($str)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }
}
