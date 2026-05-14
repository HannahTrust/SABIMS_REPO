<?php

namespace Database\Seeders;

use App\Models\Committee;
use App\Models\CouncilSession;
use App\Models\Resolution;
use App\Models\User;
use Illuminate\Database\Seeder;

class ResolutionSeeder extends Seeder
{
    public function run(): void
    {
        if (Resolution::query()->where('resolution_number', 'DEMO-2026-001')->exists()) {
            return;
        }

        $secretary = User::query()->where('email', 'sb.secretary@sabims.test')->first();

        if ($secretary === null) {
            $this->command?->warn('ResolutionSeeder skipped: sb.secretary@sabims.test not found. Run UserSeeder first.');

            return;
        }

        $plenarySession = CouncilSession::query()
            ->where('session_title', 'Demo: 1st Regular Session 2026')
            ->first();

        $healthSession = CouncilSession::query()
            ->where('session_title', 'Demo: Health Committee Special Meeting')
            ->first();

        $healthCommittee = Committee::query()->where('name', 'Committee on Health')->first();
        $socialCommittee = Committee::query()->where('name', 'Committee on Social Services')->first();
        $educationCommittee = Committee::query()->where('name', 'Committee on Education')->first();

        if ($plenarySession === null || $healthCommittee === null) {
            $this->command?->warn('ResolutionSeeder skipped: run CouncilSessionSeeder first.');

            return;
        }

        $rows = [
            [
                'resolution_number' => 'DEMO-2026-001',
                'title' => 'Demo Resolution — Supporting Barangay Health Week',
                'description' => 'A resolution expressing support for the annual Barangay Health Week activities.',
                'session_id' => $plenarySession->id,
                'committee_id' => $healthCommittee->id,
                'status' => Resolution::STATUS_APPROVED,
                'visibility' => Resolution::VISIBILITY_PUBLIC,
                'voting_result' => 'Approved unanimously',
                'year' => 2026,
            ],
            [
                'resolution_number' => 'DEMO-2026-002',
                'title' => 'Demo Resolution — Emergency Relief Fund Allocation',
                'description' => 'A resolution authorizing the release of emergency relief funds for affected families.',
                'session_id' => $plenarySession->id,
                'committee_id' => $socialCommittee?->id ?? $healthCommittee->id,
                'status' => Resolution::STATUS_DRAFT,
                'visibility' => Resolution::VISIBILITY_PRIVATE,
                'voting_result' => null,
                'year' => 2026,
            ],
            [
                'resolution_number' => 'DEMO-2025-015',
                'title' => 'Demo Resolution — Youth Leadership Program',
                'description' => 'A resolution endorsing the municipal youth leadership training program.',
                'session_id' => $plenarySession->id,
                'committee_id' => $educationCommittee?->id ?? $healthCommittee->id,
                'status' => Resolution::STATUS_ARCHIVED,
                'visibility' => Resolution::VISIBILITY_PUBLIC,
                'voting_result' => 'Approved with one abstention',
                'year' => 2025,
            ],
        ];

        if ($healthSession !== null && $healthCommittee !== null) {
            $rows[] = [
                'resolution_number' => 'DEMO-2026-003',
                'title' => 'Demo Resolution — Mobile Clinic Schedule',
                'description' => 'A resolution approving the quarterly mobile clinic schedule.',
                'session_id' => $healthSession->id,
                'committee_id' => $healthCommittee->id,
                'status' => Resolution::STATUS_APPROVED,
                'visibility' => Resolution::VISIBILITY_PRIVATE,
                'voting_result' => 'Approved',
                'year' => 2026,
            ];
        }

        foreach ($rows as $row) {
            Resolution::create([
                ...$row,
                'created_by' => $secretary->id,
            ]);
        }
    }
}
