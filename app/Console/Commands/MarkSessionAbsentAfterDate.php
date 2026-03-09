<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\CouncilSession;
use Illuminate\Console\Command;

class MarkSessionAbsentAfterDate extends Command
{
    /**
     * @var string
     */
    protected $signature = 'sessions:mark-absent-after-date';

    /**
     * @var string
     */
    protected $description = 'Mark as absent any session members who did not scan attendance after the session date has passed.';

    public function handle(): int
    {
        $sessions = CouncilSession::query()
            ->where('session_date', '<', now()->startOfDay())
            ->get();

        $marked = 0;

        foreach ($sessions as $session) {
            $updated = Attendance::query()
                ->where('session_id', $session->id)
                ->where('status', '!=', Attendance::STATUS_PRESENT)
                ->update([
                    'status' => Attendance::STATUS_ABSENT,
                    'updated_at' => now(),
                ]);

            $marked += $updated;
        }

        if ($marked > 0) {
            $this->info("Marked {$marked} attendance record(s) as absent.");
        }

        return self::SUCCESS;
    }
}
