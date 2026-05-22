<?php

namespace App\Services\Platform;

use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\Municipality;
use App\Models\User;
use Carbon\Carbon;

class PlatformDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function build(): array
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        $totalTenants = Municipality::query()->count();
        $activeTenants = Municipality::query()->where('is_active', true)->count();
        $inactiveTenants = $totalTenants - $activeTenants;
        $newTenants30d = Municipality::query()->where('created_at', '>=', $thirtyDaysAgo)->count();

        return [
            'kpis' => [
                'total_tenants' => $totalTenants,
                'active_tenants' => $activeTenants,
                'inactive_tenants' => $inactiveTenants,
                'new_tenants_30d' => $newTenants30d,
                'total_barangays' => Barangay::query()->count(),
                'total_users' => User::query()->count(),
            ],
            'recent_tenants' => $this->recentTenants(),
            'alerts' => $this->alerts(),
            'recent_activity' => $this->recentActivity(),
            'barangays_per_tenant' => $this->barangaysPerTenant(8),
            'users_per_tenant' => $this->usersPerTenant(8),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentTenants(): array
    {
        return Municipality::query()
            ->withCount('barangays')
            ->withCount('users')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn (Municipality $m) => [
                'id' => $m->id,
                'code' => $m->code,
                'name' => $m->name,
                'system_name' => $m->system_name,
                'logo_url' => $m->logo_url,
                'is_active' => $m->is_active,
                'barangays_count' => $m->barangays_count,
                'users_count' => $m->users_count,
                'created_at' => $m->created_at?->toDateTimeString(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function alerts(): array
    {
        $alerts = [];

        $inactiveWithBarangays = Municipality::query()
            ->where('is_active', false)
            ->whereHas('barangays')
            ->count();

        if ($inactiveWithBarangays > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$inactiveWithBarangays} inactive tenant(s) still have barangays assigned.",
            ];
        }

        $zeroBarangays = Municipality::query()
            ->whereDoesntHave('barangays')
            ->count();

        if ($zeroBarangays > 0) {
            $alerts[] = [
                'type' => 'info',
                'message' => "{$zeroBarangays} tenant(s) have no barangays yet (onboarding incomplete).",
            ];
        }

        $orphanMunicipalUsers = User::query()
            ->whereNull('municipality_id')
            ->whereNull('barangay_id')
            ->whereIn('role', ['admin', 'vice_mayor', 'sb_secretary', 'sb_member'])
            ->count();

        if ($orphanMunicipalUsers > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$orphanMunicipalUsers} municipal user(s) are not linked to a tenant.",
            ];
        }

        return $alerts;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentActivity(): array
    {
        return AuditLog::query()
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->limit(12)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'module' => $log->module,
                'description' => $log->description,
                'user_name' => $log->user?->name ?? 'System',
                'created_at' => $log->created_at?->toDateTimeString(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{name: string, count: int}>
     */
    private function barangaysPerTenant(int $limit): array
    {
        return Municipality::query()
            ->withCount('barangays')
            ->orderByDesc('barangays_count')
            ->limit($limit)
            ->get()
            ->map(fn (Municipality $m) => [
                'name' => $m->name,
                'count' => (int) $m->barangays_count,
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{name: string, count: int}>
     */
    private function usersPerTenant(int $limit): array
    {
        return Municipality::query()
            ->withCount('users')
            ->orderByDesc('users_count')
            ->limit($limit)
            ->get()
            ->map(fn (Municipality $m) => [
                'name' => $m->name,
                'count' => (int) $m->users_count,
            ])
            ->values()
            ->all();
    }
}
