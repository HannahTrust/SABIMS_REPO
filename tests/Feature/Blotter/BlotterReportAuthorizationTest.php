<?php

namespace Tests\Feature\Blotter;

use App\Models\Barangay;
use App\Models\User;
use Database\Seeders\BlotterPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Modules\Blotter\Models\BlotterReport;
use Modules\Blotter\Models\IncidentType;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BlotterReportAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(BlotterPermissionSeeder::class);
    }

    public function test_cross_barangay_access_is_denied(): void
    {
        $viewer = $this->makeUserWithRole('brgy_admin', 1);
        $report = $this->makeReport(2);

        $this->assertFalse(Gate::forUser($viewer)->allows('view', $report));
    }

    public function test_super_admin_has_global_access(): void
    {
        $superAdmin = $this->makeUserWithRole('super_admin', null);
        $report = $this->makeReport(2);

        $this->assertTrue(Gate::forUser($superAdmin)->allows('view', $report));
        $this->assertTrue(Gate::forUser($superAdmin)->allows('archive', $report));
    }

    public function test_purok_leader_can_only_view_own_created_cases_when_no_purok_mapping(): void
    {
        $purokLeader = $this->makeUserWithRole('purok_leader', 1);
        $ownReport = $this->makeReport(1, ['created_by' => $purokLeader->id]);
        $otherReport = $this->makeReport(1);

        $this->assertTrue(Gate::forUser($purokLeader)->allows('view', $ownReport));
        $this->assertFalse(Gate::forUser($purokLeader)->allows('view', $otherReport));
    }

    public function test_secretary_cannot_archive(): void
    {
        $secretary = $this->makeUserWithRole('brgy_secretary', 1);
        $report = $this->makeReport(1);

        $this->assertFalse(Gate::forUser($secretary)->allows('archive', $report));
    }

    public function test_resolved_blotter_cannot_be_deleted(): void
    {
        $admin = $this->makeUserWithRole('brgy_admin', 1);
        $report = $this->makeReport(1, ['status' => 'resolved']);

        $this->assertFalse(Gate::forUser($admin)->allows('delete', $report));
    }

    private function makeUserWithRole(string $role, ?int $barangayId): User
    {
        $resolvedBarangayId = null;

        if ($barangayId !== null) {
            $resolvedBarangayId = $this->makeBarangay($barangayId)->id;
        }

        $user = User::factory()->create([
            'role' => $role,
            'barangay_id' => $resolvedBarangayId,
            'is_active' => true,
        ]);

        if (Role::query()->where('name', $role)->exists()) {
            $user->syncRoles([$role]);
            $user->syncPermissions(Role::findByName($role)->permissions);
        }

        return $user;
    }

    private function makeReport(int $barangayId, array $overrides = []): BlotterReport
    {
        $barangay = $this->makeBarangay($barangayId);
        $incidentType = IncidentType::query()->firstOrCreate(['name' => 'Theft'], ['is_active' => true]);
        $complainant = $this->makeUserWithRole('resident', $barangayId);
        $creator = $this->makeUserWithRole('brgy_admin', $barangayId);

        return BlotterReport::query()->create(array_merge([
            'barangay_id' => $barangay->id,
            'purok_id' => null,
            'blotter_number' => 'BLT-2026-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
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
        ], $overrides));
    }

    private function makeBarangay(int $id): Barangay
    {
        $code = 'BRGY-'.str_pad((string) $id, 3, '0', STR_PAD_LEFT);

        return Barangay::query()->firstOrCreate(
            ['code' => $code],
            ['name' => 'Barangay '.$id, 'is_active' => true]
        );
    }
}
