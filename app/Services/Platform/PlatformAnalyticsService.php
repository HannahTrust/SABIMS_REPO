<?php

namespace App\Services\Platform;

use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\Business;
use App\Models\Municipality;
use App\Models\Resident;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Blotter\Models\BlotterReport;

class PlatformAnalyticsService
{
    /**
     * @return array<string, mixed>
     */
    public function build(?int $municipalityId = null, int $days = 30): array
    {
        $days = max(7, min(365, $days));
        $since = Carbon::now()->subDays($days)->startOfDay();

        $municipalityOptions = Municipality::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn (Municipality $m) => ['id' => $m->id, 'name' => $m->name, 'code' => $m->code])
            ->values()
            ->all();

        return [
            'filters' => [
                'municipality_id' => $municipalityId,
                'days' => $days,
            ],
            'municipalities' => $municipalityOptions,
            'kpis' => $this->kpis($municipalityId),
            'tenant_status' => $this->tenantStatusBreakdown(),
            'tenants_over_time' => $this->tenantsOverTime($since),
            'barangays_per_tenant' => $this->barangaysPerTenant($municipalityId),
            'users_per_tenant' => $this->usersPerTenant($municipalityId),
            'users_by_role' => $this->usersByRole($municipalityId),
            'module_usage_per_tenant' => $this->moduleUsagePerTenant($municipalityId),
            'audit_activity_by_day' => $this->auditActivityByDay($since, $municipalityId),
            'top_audit_modules' => $this->topAuditModules($since),
            'new_users_over_time' => $this->newUsersOverTime($since, $municipalityId),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function kpis(?int $municipalityId): array
    {
        $tenantQuery = Municipality::query();
        $barangayQuery = Barangay::query();
        $userQuery = User::query();

        if ($municipalityId !== null) {
            $tenantQuery->where('id', $municipalityId);
            $barangayQuery->where('municipality_id', $municipalityId);
            $userQuery->where(function ($q) use ($municipalityId): void {
                $q->where('municipality_id', $municipalityId)
                    ->orWhereIn('barangay_id', Barangay::query()
                        ->where('municipality_id', $municipalityId)
                        ->select('id'));
            });
        }

        $residentCount = $this->residentCount($municipalityId);
        $businessCount = $this->businessCount($municipalityId);
        $blotterCount = $this->blotterCount($municipalityId);

        return [
            'tenants' => $tenantQuery->count(),
            'active_tenants' => (clone $tenantQuery)->where('is_active', true)->count(),
            'barangays' => $barangayQuery->count(),
            'users' => $userQuery->count(),
            'residents' => $residentCount,
            'businesses' => $businessCount,
            'blotter_reports' => $blotterCount,
        ];
    }

    private function residentCount(?int $municipalityId): int
    {
        $query = Resident::query();

        if ($municipalityId !== null) {
            $query->whereIn('barangay_id', Barangay::query()
                ->where('municipality_id', $municipalityId)
                ->select('id'));
        }

        return $query->count();
    }

    private function businessCount(?int $municipalityId): int
    {
        $query = Business::query();

        if ($municipalityId !== null) {
            $query->whereIn('barangay_id', Barangay::query()
                ->where('municipality_id', $municipalityId)
                ->select('id'));
        }

        return $query->count();
    }

    private function blotterCount(?int $municipalityId): int
    {
        $query = BlotterReport::query();

        if ($municipalityId !== null) {
            $query->whereIn('barangay_id', Barangay::query()
                ->where('municipality_id', $municipalityId)
                ->select('id'));
        }

        return $query->count();
    }

    /**
     * @return array{active: int, inactive: int}
     */
    private function tenantStatusBreakdown(): array
    {
        return [
            'active' => Municipality::query()->where('is_active', true)->count(),
            'inactive' => Municipality::query()->where('is_active', false)->count(),
        ];
    }

    /**
     * @return list<array{label: string, count: int}>
     */
    private function tenantsOverTime(Carbon $since): array
    {
        $rows = Municipality::query()
            ->where('created_at', '>=', $since)
            ->get(['created_at'])
            ->groupBy(fn (Municipality $m) => $m->created_at?->format('Y-m') ?? '')
            ->map(fn ($group) => $group->count());

        return $this->fillMonthlySeries($since, $rows);
    }

    /**
     * @return list<array{label: string, count: int}>
     */
    private function newUsersOverTime(Carbon $since, ?int $municipalityId): array
    {
        $query = User::query()->where('created_at', '>=', $since);

        if ($municipalityId !== null) {
            $query->where(function ($q) use ($municipalityId): void {
                $q->where('municipality_id', $municipalityId)
                    ->orWhereIn('barangay_id', Barangay::query()
                        ->where('municipality_id', $municipalityId)
                        ->select('id'));
            });
        }

        $rows = $query
            ->get(['created_at'])
            ->groupBy(fn (User $u) => $u->created_at?->format('Y-m') ?? '')
            ->map(fn ($group) => $group->count());

        return $this->fillMonthlySeries($since, $rows);
    }

    /**
     * @param  Collection<string, mixed>  $rows
     * @return list<array{label: string, count: int}>
     */
    private function fillMonthlySeries(Carbon $since, $rows): array
    {
        $series = [];
        $cursor = $since->copy()->startOfMonth();
        $end = Carbon::now()->startOfMonth();

        while ($cursor <= $end) {
            $key = $cursor->format('Y-m');
            $series[] = [
                'label' => $cursor->format('M Y'),
                'count' => (int) ($rows[$key] ?? 0),
            ];
            $cursor->addMonth();
        }

        return $series;
    }

    /**
     * @return list<array{name: string, count: int}>
     */
    private function barangaysPerTenant(?int $municipalityId): array
    {
        $query = Municipality::query()->withCount('barangays')->orderByDesc('barangays_count');

        if ($municipalityId !== null) {
            $query->where('id', $municipalityId);
        }

        return $query->limit(15)->get()->map(fn (Municipality $m) => [
            'name' => $m->name,
            'count' => (int) $m->barangays_count,
        ])->values()->all();
    }

    /**
     * @return list<array{name: string, count: int}>
     */
    private function usersPerTenant(?int $municipalityId): array
    {
        $query = Municipality::query()->withCount('users')->orderByDesc('users_count');

        if ($municipalityId !== null) {
            $query->where('id', $municipalityId);
        }

        return $query->limit(15)->get()->map(fn (Municipality $m) => [
            'name' => $m->name,
            'count' => (int) $m->users_count,
        ])->values()->all();
    }

    /**
     * @return list<array{role: string, count: int}>
     */
    private function usersByRole(?int $municipalityId): array
    {
        $query = User::query()
            ->select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')
            ->orderByDesc('count');

        if ($municipalityId !== null) {
            $query->where(function ($q) use ($municipalityId): void {
                $q->where('municipality_id', $municipalityId)
                    ->orWhereIn('barangay_id', Barangay::query()
                        ->where('municipality_id', $municipalityId)
                        ->select('id'));
            });
        }

        return $query->get()->map(fn ($row) => [
            'role' => (string) ($row->role ?? 'unknown'),
            'count' => (int) $row->count,
        ])->values()->all();
    }

    /**
     * @return list<array{name: string, residents: int, businesses: int, blotter_reports: int}>
     */
    private function moduleUsagePerTenant(?int $municipalityId): array
    {
        $tenants = Municipality::query()
            ->when($municipalityId !== null, fn ($q) => $q->where('id', $municipalityId))
            ->orderBy('name')
            ->limit(15)
            ->get();

        return $tenants->map(function (Municipality $m) {
            $barangayIds = Barangay::query()->where('municipality_id', $m->id)->pluck('id');

            return [
                'name' => $m->name,
                'residents' => Resident::query()->whereIn('barangay_id', $barangayIds)->count(),
                'businesses' => Business::query()->whereIn('barangay_id', $barangayIds)->count(),
                'blotter_reports' => BlotterReport::query()->whereIn('barangay_id', $barangayIds)->count(),
            ];
        })->values()->all();
    }

    /**
     * @return list<array{label: string, count: int}>
     */
    private function auditActivityByDay(Carbon $since, ?int $municipalityId): array
    {
        $query = AuditLog::query()->where('created_at', '>=', $since);

        if ($municipalityId !== null) {
            $userIds = User::query()
                ->where(function ($q) use ($municipalityId): void {
                    $q->where('municipality_id', $municipalityId)
                        ->orWhereIn('barangay_id', Barangay::query()
                            ->where('municipality_id', $municipalityId)
                            ->select('id'));
                })
                ->pluck('id');

            $query->whereIn('user_id', $userIds);
        }

        $rows = $query
            ->get(['created_at'])
            ->groupBy(fn (AuditLog $log) => $log->created_at?->format('Y-m-d') ?? '')
            ->map(fn ($group) => $group->count());

        $series = [];
        $cursor = $since->copy()->startOfDay();
        $end = Carbon::now()->startOfDay();

        while ($cursor <= $end) {
            $key = $cursor->format('Y-m-d');
            $series[] = [
                'label' => $cursor->format('M j'),
                'count' => (int) ($rows[$key] ?? 0),
            ];
            $cursor->addDay();
        }

        return $series;
    }

    /**
     * @return list<array{name: string, count: int}>
     */
    private function topAuditModules(Carbon $since): array
    {
        return AuditLog::query()
            ->where('created_at', '>=', $since)
            ->select('module', DB::raw('COUNT(*) as count'))
            ->groupBy('module')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'name' => (string) $row->module,
                'count' => (int) $row->count,
            ])
            ->values()
            ->all();
    }
}
