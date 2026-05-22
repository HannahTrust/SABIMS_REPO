<?php

namespace Tests\Feature\Platform;

use App\Models\AuditLog;
use App\Models\Municipality;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformDashboardAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_admin_sees_platform_dashboard(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
            'municipality_id' => null,
        ]);

        Municipality::query()->create([
            'code' => 'test-lgu',
            'name' => 'Test LGU',
            'system_name' => 'Test Portal',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('dashboard/platform')
                ->has('kpis')
                ->has('recent_tenants')
            );
    }

    public function test_municipal_admin_sees_standard_dashboard(): void
    {
        $municipality = Municipality::query()->create([
            'code' => 'city-a',
            'name' => 'City A',
            'system_name' => 'City A Portal',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'municipality_id' => $municipality->id,
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('dashboard'));
    }

    public function test_platform_analytics_page(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
            'municipality_id' => null,
        ]);

        $this->actingAs($admin)
            ->get(route('platform.analytics.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Platform/Analytics/Index')
                ->has('kpis')
                ->has('tenants_over_time')
            );
    }

    public function test_platform_reports_and_csv_exports(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
            'municipality_id' => null,
        ]);

        Municipality::query()->create([
            'code' => 'export-lgu',
            'name' => 'Export LGU',
            'system_name' => 'Export Portal',
            'is_active' => true,
        ]);

        AuditLog::query()->create([
            'user_id' => $admin->id,
            'action' => 'create',
            'module' => 'municipality',
            'record_id' => 1,
            'description' => 'Test audit entry',
            'ip_address' => '127.0.0.1',
            'created_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get(route('platform.reports.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Platform/Reports/Index')
                ->has('audit_preview')
            );

        $this->actingAs($admin)
            ->get(route('platform.reports.tenants.export'))
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $this->actingAs($admin)
            ->get(route('platform.reports.audit.export'))
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_municipal_admin_cannot_access_platform_analytics(): void
    {
        $municipality = Municipality::query()->create([
            'code' => 'city-b',
            'name' => 'City B',
            'system_name' => 'City B',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'municipality_id' => $municipality->id,
        ]);

        $this->actingAs($user)->get(route('platform.analytics.index'))->assertForbidden();
        $this->actingAs($user)->get(route('platform.reports.index'))->assertForbidden();
    }
}
