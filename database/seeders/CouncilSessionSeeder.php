<?php

namespace Database\Seeders;

use App\Models\Committee;
use App\Models\CouncilSession;
use App\Models\User;
use Illuminate\Database\Seeder;

class CouncilSessionSeeder extends Seeder
{
    public function run(): void
    {
        if (CouncilSession::query()->where('session_title', 'Demo: 1st Regular Session 2026')->exists()) {
            return;
        }

        $secretary = User::query()->where('email', 'sb.secretary@sabims.test')->first();

        if ($secretary === null) {
            $this->command?->warn('CouncilSessionSeeder skipped: sb.secretary@sabims.test not found. Run UserSeeder first.');

            return;
        }

        $healthCommittee = Committee::query()->where('name', 'Committee on Health')->first();
        $educationCommittee = Committee::query()->where('name', 'Committee on Education')->first();

        $plenaryClosed = CouncilSession::create([
            'session_title' => 'Demo: 1st Regular Session 2026',
            'session_date' => '2026-01-15',
            'committee_id' => null,
            'attendance_status' => CouncilSession::ATTENDANCE_CLOSED,
            'agenda' => 'Opening prayer, roll call, reading and approval of previous minutes, committee reports, new business.',
            'minutes_type' => 'text',
            'minutes_content' => 'The session was called to order at 9:00 AM. All committee reports were received. No objections were raised on the previous minutes.',
            'created_by' => $secretary->id,
        ]);

        $plenaryOpen = CouncilSession::create([
            'session_title' => 'Demo: 2nd Regular Session 2026 (Attendance Open)',
            'session_date' => '2026-02-20',
            'committee_id' => null,
            'attendance_status' => CouncilSession::ATTENDANCE_OPEN,
            'agenda' => 'Attendance check, ordinance readings, resolution approvals.',
            'minutes_type' => 'text',
            'minutes_content' => null,
            'created_by' => $secretary->id,
        ]);

        $sessions = collect([$plenaryClosed, $plenaryOpen]);

        if ($healthCommittee !== null) {
            $sessions->push(CouncilSession::create([
                'session_title' => 'Demo: Health Committee Special Meeting',
                'session_date' => '2026-03-05',
                'committee_id' => $healthCommittee->id,
                'attendance_status' => CouncilSession::ATTENDANCE_CLOSED,
                'agenda' => 'Review of barangay health programs and vaccination drive updates.',
                'minutes_type' => 'text',
                'minutes_content' => 'The committee discussed mobile clinic schedules and medicine inventory reporting.',
                'created_by' => $secretary->id,
            ]));
        }

        if ($educationCommittee !== null) {
            $sessions->push(CouncilSession::create([
                'session_title' => 'Demo: Education Committee Session',
                'session_date' => '2026-03-12',
                'committee_id' => $educationCommittee->id,
                'attendance_status' => CouncilSession::ATTENDANCE_CLOSED,
                'agenda' => 'Scholarship program updates and youth skills training proposals.',
                'minutes_type' => 'text',
                'minutes_content' => 'The committee endorsed two scholarship applicants for municipal review.',
                'created_by' => $secretary->id,
            ]));
        }

    }
}
