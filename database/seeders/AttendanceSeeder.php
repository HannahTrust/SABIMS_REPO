<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\CouncilSession;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AttendanceSeeder extends Seeder
{
    private const DEMO_REMARK = 'Demo: SB member marked present';

    public function run(): void
    {
        $sbMemberIds = User::query()
            ->where('role', 'sb_member')
            ->pluck('id');

        if ($sbMemberIds->isEmpty()) {
            $this->command?->warn('AttendanceSeeder skipped: no sb_member users found. Run UserSeeder first.');

            return;
        }

        $demoSessionIds = CouncilSession::query()
            ->where('session_title', 'like', 'Demo:%')
            ->pluck('id');

        if ($demoSessionIds->isEmpty()) {
            $this->command?->warn('AttendanceSeeder skipped: no demo sessions found. Run CouncilSessionSeeder first.');

            return;
        }

        $alreadySeeded = Attendance::query()
            ->whereIn('session_id', $demoSessionIds)
            ->whereIn('user_id', $sbMemberIds)
            ->where('remarks', self::DEMO_REMARK)
            ->where('status', Attendance::STATUS_PRESENT)
            ->count();

        $expectedCount = Attendance::query()
            ->whereIn('session_id', $demoSessionIds)
            ->whereIn('user_id', $sbMemberIds)
            ->count();

        if ($expectedCount > 0 && $alreadySeeded === $expectedCount) {
            return;
        }

        $attendances = Attendance::query()
            ->with('session:id,session_date')
            ->whereIn('session_id', $demoSessionIds)
            ->whereIn('user_id', $sbMemberIds)
            ->get();

        foreach ($attendances as $attendance) {
            $scannedAt = $attendance->session?->session_date
                ? Carbon::parse($attendance->session->session_date)->setTime(8, 30)
                : now();

            $attendance->update([
                'status' => Attendance::STATUS_PRESENT,
                'remarks' => self::DEMO_REMARK,
                'time_scanned' => $attendance->time_scanned ?? $scannedAt,
            ]);
        }
    }
}
