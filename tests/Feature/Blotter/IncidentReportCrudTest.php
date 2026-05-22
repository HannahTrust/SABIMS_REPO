<?php

namespace Tests\Feature\Blotter;

use App\Models\Barangay;
use App\Models\Municipality;
use App\Models\User;
use Database\Seeders\BlotterPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Blotter\Models\BlotterReport;
use Modules\Blotter\Models\IncidentType;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class IncidentReportCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(BlotterPermissionSeeder::class);
    }

    public function test_brgy_admin_can_create_view_and_update_incident_report(): void
    {
        $barangay = $this->makeBarangay(1);
        $admin = $this->makeUserWithRole('brgy_admin', $barangay->id);
        $complainant = $this->makeUserWithRole('resident', $barangay->id);
        $incidentType = IncidentType::query()->firstOrCreate(['name' => 'Theft'], ['is_active' => true]);

        $this->actingAs($admin)
            ->post('/incident-reports', [
                'incident_type_id' => $incidentType->id,
                'complainant_id' => $complainant->id,
                'respondent_name' => 'John Outsider',
                'incident_datetime' => now()->format('Y-m-d H:i:s'),
                'incident_location' => 'Purok 1',
                'narrative' => 'Detailed incident narrative for testing purposes.',
                'status' => 'pending',
            ])
            ->assertRedirect();

        $report = BlotterReport::query()->first();
        $this->assertNotNull($report);
        $this->assertStringStartsWith('INC-', $report->blotter_number);

        $this->actingAs($admin)
            ->get("/incident-reports/{$report->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('IncidentReport/Show')
                ->has('report')
                ->where('report.report_number', $report->blotter_number));

        $this->actingAs($admin)
            ->put("/incident-reports/{$report->id}", [
                'incident_type_id' => $incidentType->id,
                'complainant_id' => $complainant->id,
                'respondent_name' => 'John Outsider Updated',
                'incident_datetime' => now()->format('Y-m-d H:i:s'),
                'incident_location' => 'Purok 2',
                'narrative' => 'Updated incident narrative with sufficient detail.',
                'status' => 'under_mediation',
            ])
            ->assertRedirect(route('incident-reports.show', $report));

        $this->assertSame('under_mediation', $report->fresh()->status);
    }

    public function test_resolve_and_archive_actions_work(): void
    {
        $barangay = $this->makeBarangay(1);
        $admin = $this->makeUserWithRole('brgy_admin', $barangay->id);
        $report = $this->makeReport($barangay->id);

        $this->actingAs($admin)
            ->post("/incident-reports/{$report->id}/resolve")
            ->assertRedirect(route('incident-reports.show', $report));

        $this->assertSame('resolved', $report->fresh()->status);

        $this->actingAs($admin)
            ->post("/incident-reports/{$report->id}/archive")
            ->assertRedirect(route('incident-reports.show', $report));

        $this->assertSame('archived', $report->fresh()->status);
    }

    public function test_legacy_blotter_url_redirects_to_incident_reports(): void
    {
        $barangay = $this->makeBarangay(1);
        $admin = $this->makeUserWithRole('brgy_admin', $barangay->id);

        $this->actingAs($admin)
            ->get('/blotter-reports')
            ->assertRedirect('/incident-reports');
    }

    public function test_print_page_renders(): void
    {
        $barangay = $this->makeBarangay(1);
        $admin = $this->makeUserWithRole('brgy_admin', $barangay->id);
        $report = $this->makeReport($barangay->id);

        $this->actingAs($admin)
            ->get("/incident-reports/{$report->id}/print")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('IncidentReport/Print'));
    }

    private function makeUserWithRole(string $role, int $barangayId): User
    {
        $user = User::factory()->create([
            'role' => $role,
            'barangay_id' => $barangayId,
            'is_active' => true,
        ]);

        if (Role::query()->where('name', $role)->exists()) {
            $user->syncRoles([$role]);
            $user->syncPermissions(Role::findByName($role)->permissions);
        }

        return $user;
    }

    private function makeReport(int $barangayId): BlotterReport
    {
        $incidentType = IncidentType::query()->firstOrCreate(['name' => 'Theft'], ['is_active' => true]);
        $complainant = $this->makeUserWithRole('resident', $barangayId);
        $creator = $this->makeUserWithRole('brgy_admin', $barangayId);

        return BlotterReport::query()->create([
            'barangay_id' => $barangayId,
            'purok_id' => null,
            'blotter_number' => 'INC-2026-0001',
            'incident_type_id' => $incidentType->id,
            'complainant_id' => $complainant->id,
            'respondent_id' => null,
            'respondent_name' => 'Outsider Respondent',
            'incident_datetime' => now(),
            'incident_location' => 'Barangay Hall',
            'narrative' => 'Incident narrative.',
            'action_taken' => null,
            'remarks' => null,
            'assigned_to' => null,
            'status' => 'pending',
            'settlement_date' => null,
            'created_by' => $creator->id,
            'updated_by' => $creator->id,
        ]);
    }

    private function makeBarangay(int $id): Barangay
    {
        $code = 'BRGY-'.str_pad((string) $id, 3, '0', STR_PAD_LEFT);

        $municipality = Municipality::query()->firstOrCreate(
            ['code' => 'MUN-TEST'],
            [
                'name' => 'Test Municipality',
                'system_name' => 'Test Municipality Portal',
                'is_active' => true,
            ]
        );

        return Barangay::query()->firstOrCreate(
            ['code' => $code],
            [
                'name' => 'Barangay '.$id,
                'municipality_id' => $municipality->id,
                'is_active' => true,
            ]
        );
    }
}
