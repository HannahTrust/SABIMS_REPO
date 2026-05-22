<?php

namespace Tests\Feature\Platform;

use App\Models\Municipality;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MunicipalityTenantTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_admin_can_view_tenant_index(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
            'municipality_id' => null,
        ]);

        Municipality::query()->create([
            'code' => 'test-lgu',
            'name' => 'Test LGU',
            'system_name' => 'Test Portal',
            'module_name' => 'Module',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get(route('platform.tenants.index'));

        $response->assertOk();
    }

    public function test_municipal_admin_cannot_view_tenant_index(): void
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

        $this->actingAs($user)->get(route('platform.tenants.index'))->assertForbidden();
    }

    public function test_municipal_admin_can_update_branding_settings(): void
    {
        $municipality = Municipality::query()->create([
            'code' => 'city-b',
            'name' => 'City B',
            'system_name' => 'Old Name',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'municipality_id' => $municipality->id,
        ]);

        $this->actingAs($user)
            ->patch(route('municipality-settings.update'), [
                'system_name' => 'New Portal Name',
                'module_name' => 'Legislative',
            ])
            ->assertRedirect(route('municipality-settings.edit'));

        $this->assertDatabaseHas('municipalities', [
            'id' => $municipality->id,
            'system_name' => 'New Portal Name',
            'module_name' => 'Legislative',
        ]);
    }
}
