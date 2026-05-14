<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\BusinessClearance;
use App\Models\BusinessDocument;
use App\Models\BusinessOwner;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BusinessRegistryService
{
    public function generateBusinessCode(): string
    {
        $year = now()->year;
        $prefix = sprintf('BUS-%d-', $year);

        $last = Business::query()
            ->where('business_code', 'like', $prefix.'%')
            ->orderByDesc('business_code')
            ->value('business_code');

        $next = 1;
        if ($last !== null && preg_match('/-(\d+)$/', $last, $matches)) {
            $next = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function generateClearanceNumber(): string
    {
        $year = now()->year;
        $prefix = sprintf('CLR-%d-', $year);

        $last = BusinessClearance::query()
            ->where('clearance_number', 'like', $prefix.'%')
            ->orderByDesc('clearance_number')
            ->value('clearance_number');

        $next = 1;
        if ($last !== null && preg_match('/-(\d+)$/', $last, $matches)) {
            $next = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $attributes  Fillable business attributes (excluding business_code).
     * @param  list<array{resident_id?: int|null, full_name: string, contact_number: string, email?: string|null, ownership_percentage?: int|null}>  $additionalOwners
     */
    public function registerBusiness(
        array $attributes,
        User $user,
        ?UploadedFile $logo = null,
        array $additionalOwners = [],
        ?string $ip = null
    ): Business {
        return DB::transaction(function () use ($attributes, $user, $logo, $additionalOwners, $ip): Business {
            $attributes['business_code'] = $this->generateBusinessCode();

            /** @var Business $business */
            $business = Business::query()->create($attributes);

            if ($logo !== null) {
                $path = $logo->store("businesses/{$business->id}", 'public');
                $business->forceFill(['logo_path' => $path])->save();
            }

            foreach ($additionalOwners as $row) {
                BusinessOwner::query()->create([
                    'business_id' => $business->id,
                    'resident_id' => $row['resident_id'] ?? null,
                    'full_name' => $row['full_name'],
                    'contact_number' => $row['contact_number'],
                    'email' => $row['email'] ?? null,
                    'ownership_percentage' => $row['ownership_percentage'] ?? null,
                ]);
            }

            $this->writeAudit($user, 'registered', $business->id, 'Business registered: '.$business->business_name.' ('.$business->business_code.').', $ip);

            return $business->fresh(['category', 'barangay', 'purok', 'owners']);
        });
    }

    /**
     * @param  array{permit_number?: string|null, permit_issue_date?: string|null, permit_expiration_date?: string|null}  $permit
     */
    public function renewPermit(Business $business, array $permit, User $user, ?string $ip = null): Business
    {
        return DB::transaction(function () use ($business, $permit, $user, $ip): Business {
            $business->fill([
                'permit_number' => $permit['permit_number'] ?? $business->permit_number,
                'permit_issue_date' => isset($permit['permit_issue_date'])
                    ? CarbonImmutable::parse($permit['permit_issue_date'])
                    : $business->permit_issue_date,
                'permit_expiration_date' => isset($permit['permit_expiration_date'])
                    ? CarbonImmutable::parse($permit['permit_expiration_date'])
                    : $business->permit_expiration_date,
            ]);
            $business->save();

            $this->writeAudit($user, 'permit_renewed', $business->id, 'Permit renewed for '.$business->business_name.'.', $ip);

            return $business->fresh();
        });
    }

    /**
     * @param  array{expiration_date?: string|null, remarks?: string|null}  $data
     */
    public function generateClearance(Business $business, User $issuer, array $data = [], ?string $ip = null): BusinessClearance
    {
        if ($business->isClosed()) {
            throw new \RuntimeException('Closed businesses cannot receive new clearances.');
        }

        return DB::transaction(function () use ($business, $issuer, $data, $ip): BusinessClearance {
            $clearance = BusinessClearance::query()->create([
                'business_id' => $business->id,
                'clearance_number' => $this->generateClearanceNumber(),
                'issued_by' => $issuer->id,
                'issue_date' => now()->toDateString(),
                'expiration_date' => isset($data['expiration_date']) && $data['expiration_date'] !== null && $data['expiration_date'] !== ''
                    ? CarbonImmutable::parse($data['expiration_date'])
                    : null,
                'status' => BusinessClearance::STATUS_ACTIVE,
                'remarks' => $data['remarks'] ?? null,
            ]);

            $this->writeAudit($issuer, 'clearance_generated', $business->id, 'Clearance '.$clearance->clearance_number.' issued.', $ip);

            return $clearance->fresh(['issuer']);
        });
    }

    /**
     * @return list<string> Stored public disk paths
     */
    public function uploadDocuments(Business $business, array $files, User $user, ?string $ip = null): array
    {
        return DB::transaction(function () use ($business, $files, $user, $ip): array {
            $paths = [];

            foreach ($files as $item) {
                if (! isset($item['document_type'], $item['file']) || ! $item['file'] instanceof UploadedFile) {
                    continue;
                }

                /** @var UploadedFile $upload */
                $upload = $item['file'];
                $stored = $upload->store("businesses/{$business->id}/documents", 'public');

                BusinessDocument::query()->create([
                    'business_id' => $business->id,
                    'document_type' => $item['document_type'],
                    'file_path' => $stored,
                    'uploaded_by' => $user->id,
                ]);

                $paths[] = $stored;
            }

            if ($paths !== []) {
                $this->writeAudit($user, 'documents_uploaded', $business->id, count($paths).' document(s) uploaded.', $ip);
            }

            return $paths;
        });
    }

    public function deleteDocument(BusinessDocument $document, User $user, ?string $ip = null): void
    {
        DB::transaction(function () use ($document, $user, $ip): void {
            if ($document->file_path !== '' && $document->file_path !== null) {
                Storage::disk('public')->delete($document->file_path);
            }

            $businessId = $document->business_id;
            $document->delete();

            $this->writeAudit($user, 'document_deleted', $businessId, 'A business document was removed.', $ip);
        });
    }

    /**
     * Replace co-owner rows (excludes primary owner fields on `businesses`).
     *
     * @param  list<array{resident_id?: int|null, full_name: string, contact_number: string, email?: string|null, ownership_percentage?: int|null}>  $owners
     */
    public function syncAdditionalOwners(Business $business, array $owners): void
    {
        DB::transaction(function () use ($business, $owners): void {
            BusinessOwner::query()->where('business_id', $business->id)->delete();

            foreach ($owners as $row) {
                BusinessOwner::query()->create([
                    'business_id' => $business->id,
                    'resident_id' => $row['resident_id'] ?? null,
                    'full_name' => $row['full_name'],
                    'contact_number' => $row['contact_number'],
                    'email' => $row['email'] ?? null,
                    'ownership_percentage' => $row['ownership_percentage'] ?? null,
                ]);
            }
        });
    }

    public function archiveBusiness(Business $business, User $user, ?string $remarks = null, ?string $ip = null): Business
    {
        return DB::transaction(function () use ($business, $user, $remarks, $ip): Business {
            $business->forceFill([
                'status' => Business::STATUS_CLOSED,
                'remarks' => $remarks ?? $business->remarks,
            ]);
            $business->save();

            $this->writeAudit($user, 'archived', $business->id, 'Business archived (closed): '.$business->business_name.'.', $ip);

            return $business->fresh();
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function getBusinessAnalytics(?Barangay $barangay): array
    {
        $base = Business::query();
        if ($barangay !== null) {
            $base->where('barangay_id', $barangay->id);
        }

        $since = now()->subDays(30)->startOfDay();

        $total = (clone $base)->count();
        $active = (clone $base)->where('status', Business::STATUS_ACTIVE)->count();
        $closed = (clone $base)->where('status', Business::STATUS_CLOSED)->count();
        $pending = (clone $base)->where('status', Business::STATUS_PENDING)->count();

        $newRegistrations = (clone $base)->where('created_at', '>=', $since)->count();

        $expiredPermits = (clone $base)
            ->whereNotNull('permit_expiration_date')
            ->whereDate('permit_expiration_date', '<', now()->toDateString())
            ->where('status', Business::STATUS_ACTIVE)
            ->count();

        $byCategory = (clone $base)
            ->selectRaw('business_category_id, COUNT(*) as c')
            ->groupBy('business_category_id')
            ->pluck('c', 'business_category_id');

        $categoryLabels = BusinessCategory::query()
            ->whereIn('id', $byCategory->keys()->all())
            ->pluck('name', 'id');

        $by_category = $byCategory->map(fn (int $count, $id) => [
            'name' => $categoryLabels[$id] ?? 'Unknown',
            'count' => $count,
        ])->values()->sortByDesc('count')->values()->all();

        $purokQuery = DB::table('businesses')
            ->join('puroks', 'puroks.id', '=', 'businesses.purok_id')
            ->selectRaw('puroks.name as name, COUNT(*) as c')
            ->groupBy('puroks.name');

        if ($barangay !== null) {
            $purokQuery->where('businesses.barangay_id', $barangay->id);
        }

        $by_purok = $purokQuery
            ->orderByDesc('c')
            ->limit(12)
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'count' => (int) $row->c])
            ->all();

        $permitTrend = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i)->startOfMonth();
            $label = $month->format('M Y');
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();

            $q = Business::query()
                ->whereNotNull('permit_expiration_date')
                ->whereBetween('permit_expiration_date', [$start->toDateString(), $end->toDateString()]);

            if ($barangay !== null) {
                $q->where('barangay_id', $barangay->id);
            }

            $permitTrend[] = [
                'label' => $label,
                'count' => $q->count(),
            ];
        }

        return [
            'total_businesses' => $total,
            'active_businesses' => $active,
            'closed_businesses' => $closed,
            'pending_businesses' => $pending,
            'new_registrations_30d' => $newRegistrations,
            'expired_permits' => $expiredPermits,
            'by_category' => $by_category,
            'by_purok' => $by_purok,
            'permit_expiration_trend' => $permitTrend,
        ];
    }

    /**
     * @param  Builder<Business>  $query
     */
    public function paginateFiltered(Builder $query, int $perPage = 20): LengthAwarePaginator
    {
        return $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    protected function writeAudit(User $user, string $action, ?int $recordId, string $description, ?string $ip): void
    {
        AuditLog::query()->insert([
            'user_id' => $user->id,
            'action' => $action,
            'module' => 'business_registry',
            'record_id' => $recordId,
            'description' => $description,
            'ip_address' => $ip,
            'created_at' => now(),
        ]);
    }
}
