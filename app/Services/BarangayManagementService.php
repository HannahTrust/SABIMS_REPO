<?php

namespace App\Services;

use App\Models\Barangay;
use App\Models\BarangayOfficial;
use App\Models\BarangayOfficialPosition;
use App\Models\Purok;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BarangayManagementService
{
    public const LOGO_DIR = 'barangays/logos';

    public const OFFICIAL_PHOTO_DIR = 'barangays/officials/photos';

    public const OFFICIAL_SIGNATURE_DIR = 'barangays/officials/signatures';

    public function createBarangay(array $data, ?UploadedFile $logo = null): Barangay
    {
        if ($logo !== null) {
            $data['logo_path'] = $this->storePublicFile($logo, self::LOGO_DIR);
        }

        return Barangay::query()->create($data);
    }

    public function updateBarangay(Barangay $barangay, array $data, ?UploadedFile $logo = null): Barangay
    {
        if ($logo !== null) {
            $this->deleteIfSet($barangay->logo_path);
            $data['logo_path'] = $this->storePublicFile($logo, self::LOGO_DIR);
        }

        $barangay->update($data);

        return $barangay->fresh();
    }

    public function createPurok(Barangay $barangay, array $data): Purok
    {
        $data['barangay_id'] = $barangay->id;

        return Purok::query()->create($data);
    }

    public function updatePurok(Purok $purok, array $data): Purok
    {
        $purok->update($data);

        return $purok->fresh();
    }

    /**
     * @param  array{
     *     official_position_id:int,
     *     full_name:string,
     *     contact_number?:string|null,
     *     email?:string|null,
     *     term_start:string|CarbonInterface,
     *     term_end?:string|CarbonInterface|null,
     *     is_current?:bool,
     *     resident_id?:int|null,
     *     user_id?:int|null,
     * }  $data
     */
    public function assignOfficial(Barangay $barangay, array $data, ?UploadedFile $photo = null, ?UploadedFile $signature = null): BarangayOfficial
    {
        $data['barangay_id'] = $barangay->id;

        $position = BarangayOfficialPosition::query()->findOrFail($data['official_position_id']);

        if ($photo !== null) {
            $data['photo_path'] = $this->storePublicFile($photo, self::OFFICIAL_PHOTO_DIR);
        }

        if ($signature !== null) {
            $data['signature_path'] = $this->storePublicFile($signature, self::OFFICIAL_SIGNATURE_DIR);
        }

        return DB::transaction(function () use ($data, $position, $barangay): BarangayOfficial {
            $official = BarangayOfficial::query()->create($data);

            if ($official->is_current) {
                $this->ensureSingleCaptain($barangay, $official, $position);
            }

            $this->refreshOfficialActiveState($official);

            return $official->fresh(['position']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateOfficial(
        BarangayOfficial $official,
        array $data,
        ?UploadedFile $photo = null,
        ?UploadedFile $signature = null,
    ): BarangayOfficial {
        if ($photo !== null) {
            $this->deleteIfSet($official->photo_path);
            $data['photo_path'] = $this->storePublicFile($photo, self::OFFICIAL_PHOTO_DIR);
        }

        if ($signature !== null) {
            $this->deleteIfSet($official->signature_path);
            $data['signature_path'] = $this->storePublicFile($signature, self::OFFICIAL_SIGNATURE_DIR);
        }

        return DB::transaction(function () use ($official, $data): BarangayOfficial {
            $official->update($data);
            $official->load('position');

            if ($official->is_current && $official->position) {
                $this->ensureSingleCaptain($official->barangay, $official, $official->position);
            }

            $this->refreshOfficialActiveState($official);

            return $official->fresh(['position']);
        });
    }

    public function endOfficialTerm(BarangayOfficial $official): BarangayOfficial
    {
        $official->update([
            'is_current' => false,
            'term_end' => $official->term_end ?? now()->toDateString(),
        ]);

        return $official->fresh(['position']);
    }

    public function setCurrentOfficial(BarangayOfficial $official, bool $current = true): BarangayOfficial
    {
        return DB::transaction(function () use ($official, $current): BarangayOfficial {
            $official->load('position', 'barangay');

            $official->update(['is_current' => $current]);

            if ($current && $official->position) {
                $this->ensureSingleCaptain($official->barangay, $official, $official->position);
            }

            $this->refreshOfficialActiveState($official);

            return $official->fresh(['position']);
        });
    }

    /**
     * Officials marked current with valid terms.
     *
     * @return Collection<int, BarangayOfficial>
     */
    public function getCurrentOfficials(Barangay $barangay): Collection
    {
        $this->markExpiredOfficialsInactive($barangay->id);

        return BarangayOfficial::query()
            ->where('barangay_officials.barangay_id', $barangay->id)
            ->where('barangay_officials.is_current', true)
            ->join('barangay_official_positions as bop', 'bop.id', '=', 'barangay_officials.official_position_id')
            ->orderByDesc('bop.hierarchy_level')
            ->select('barangay_officials.*')
            ->with('position')
            ->get();
    }

    /**
     * @return array{
     *     residents_count:int,
     *     puroks_count:int,
     *     current_officials_count:int,
     * }
     */
    public function getBarangayStatistics(Barangay $barangay): array
    {
        $this->markExpiredOfficialsInactive($barangay->id);

        return [
            'residents_count' => User::query()
                ->where('barangay_id', $barangay->id)
                ->where('role', 'resident')
                ->count(),
            'puroks_count' => Purok::query()->where('barangay_id', $barangay->id)->count(),
            'current_officials_count' => BarangayOfficial::query()
                ->where('barangay_id', $barangay->id)
                ->where('is_current', true)
                ->count(),
        ];
    }

    /**
     * Expired terms: clear is_current for officials past term_end.
     */
    public function markExpiredOfficialsInactive(?int $barangayId = null): int
    {
        $today = now()->toDateString();

        $query = BarangayOfficial::query()
            ->where('is_current', true)
            ->whereNotNull('term_end')
            ->whereDate('term_end', '<', $today);

        if ($barangayId !== null) {
            $query->where('barangay_id', $barangayId);
        }

        return $query->update(['is_current' => false]);
    }

    protected function ensureSingleCaptain(
        Barangay $barangay,
        BarangayOfficial $current,
        BarangayOfficialPosition $position,
    ): void {
        if (! $position->isCaptain()) {
            return;
        }

        BarangayOfficial::query()
            ->where('barangay_id', $barangay->id)
            ->where('id', '!=', $current->id)
            ->where('official_position_id', $position->id)
            ->where('is_current', true)
            ->update(['is_current' => false]);
    }

    protected function refreshOfficialActiveState(BarangayOfficial $official): void
    {
        $official->refresh();

        if (! $official->is_current || $official->term_end === null) {
            return;
        }

        $today = now()->toDateString();

        if ($official->term_end->toDateString() < $today) {
            $official->update(['is_current' => false]);
        }
    }

    protected function storePublicFile(UploadedFile $file, string $directory): string
    {
        $path = $file->store($directory, 'public');

        return $path;
    }

    protected function deleteIfSet(?string $path): void
    {
        if ($path === null || $path === '') {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
