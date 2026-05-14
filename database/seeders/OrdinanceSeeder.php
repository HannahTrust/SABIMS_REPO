<?php

namespace Database\Seeders;

use App\Models\Committee;
use App\Models\CouncilSession;
use App\Models\Ordinance;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class OrdinanceSeeder extends Seeder
{
    public function run(): void
    {
        if (Ordinance::query()->where('ordinance_number', 'DEMO-ORD-2026-001')->exists()) {
            return;
        }

        $secretary = User::query()->where('email', 'sb.secretary@sabims.test')->first();

        if ($secretary === null) {
            $this->command?->warn('OrdinanceSeeder skipped: sb.secretary@sabims.test not found. Run UserSeeder first.');

            return;
        }

        $plenarySession = CouncilSession::query()
            ->where('session_title', 'Demo: 1st Regular Session 2026')
            ->first();

        $healthCommittee = Committee::query()->where('name', 'Committee on Health')->first();
        $agricultureCommittee = Committee::query()->where('name', 'Committee on Agriculture')->first();
        $foodCommittee = Committee::query()->where('name', 'Committee on Food')->first();
        $educationCommittee = Committee::query()->where('name', 'Committee on Education')->first();

        if ($healthCommittee === null) {
            $this->command?->warn('OrdinanceSeeder skipped: run CommitteeSeeder first.');

            return;
        }

        $approvedAt = Carbon::parse('2026-01-20 14:30:00');

        $rows = [
            [
                'title' => 'Demo Ordinance — Barangay Curfew for Minors',
                'ordinance_number' => 'DEMO-ORD-2026-001',
                'description' => 'An ordinance establishing curfew hours for minors within the barangay.',
                'committee_id' => $healthCommittee->id,
                'session_id' => $plenarySession?->id,
                'status' => Ordinance::STATUS_DRAFT,
                'approved_by' => null,
                'approved_at' => null,
            ],
            [
                'title' => 'Demo Ordinance — Farmers Market Operations',
                'ordinance_number' => 'DEMO-ORD-2026-002',
                'description' => 'An ordinance regulating the schedule and sanitation standards of the farmers market.',
                'committee_id' => $agricultureCommittee?->id ?? $healthCommittee->id,
                'session_id' => $plenarySession?->id,
                'status' => Ordinance::STATUS_REVIEWED,
                'approved_by' => null,
                'approved_at' => null,
            ],
            [
                'title' => 'Demo Ordinance — Food Safety Compliance',
                'ordinance_number' => 'DEMO-ORD-2026-003',
                'description' => 'An ordinance requiring food handlers to comply with basic safety and hygiene standards.',
                'committee_id' => $foodCommittee?->id ?? $healthCommittee->id,
                'session_id' => $plenarySession?->id,
                'status' => Ordinance::STATUS_APPROVED,
                'approved_by' => $secretary->id,
                'approved_at' => $approvedAt,
            ],
            [
                'title' => 'Demo Ordinance — Scholarship Grant Guidelines',
                'ordinance_number' => 'DEMO-ORD-2025-010',
                'description' => 'An ordinance prescribing guidelines for barangay scholarship grants.',
                'committee_id' => $educationCommittee?->id ?? $healthCommittee->id,
                'session_id' => null,
                'status' => Ordinance::STATUS_ARCHIVED,
                'approved_by' => $secretary->id,
                'approved_at' => Carbon::parse('2025-11-10 10:00:00'),
            ],
        ];

        foreach ($rows as $row) {
            Ordinance::create([
                ...$row,
                'created_by' => $secretary->id,
            ]);
        }
    }
}
