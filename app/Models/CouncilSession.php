<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CouncilSession extends Model
{
    protected $table = 'council_sessions';

    public const ATTENDANCE_OPEN = 'open';

    public const ATTENDANCE_CLOSED = 'closed';

    /** @var list<string> */
    protected $fillable = [
        'session_title',
        'session_date',
        'committee_id',
        'attendance_status',
        'qr_token',
        'agenda',
        'minutes_type',
        'minutes_file',
        'minutes_content',
        'created_by',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'session_date' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (self $session): void {
            if (! $session->qr_token) {
                $session->updateQuietly(['qr_token' => Str::random(64)]);
            }

            $memberIds = $session->getExpectedMemberIds();

            if ($memberIds->isEmpty()) {
                return;
            }

            $now = now();
            $rows = $memberIds->map(fn (int $userId): array => [
                'session_id' => $session->id,
                'user_id' => $userId,
                'status' => Attendance::STATUS_ABSENT,
                'remarks' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            Attendance::query()->insert($rows);
        });
    }

    /**
     * Get user IDs expected for this session (committee members or all SB members).
     *
     * @return \Illuminate\Support\Collection<int, int>
     */
    public function getExpectedMemberIds(): \Illuminate\Support\Collection
    {
        if ($this->committee_id) {
            return \Illuminate\Support\Facades\DB::table('committee_user')
                ->where('committee_id', $this->committee_id)
                ->pluck('user_id');
        }

        return User::query()
            ->where('role', 'sb_member')
            ->pluck('id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function committee(): BelongsTo
    {
        return $this->belongsTo(Committee::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'session_id');
    }

    public function resolutions(): HasMany
    {
        return $this->hasMany(Resolution::class, 'session_id');
    }

    public function isAttendanceOpen(): bool
    {
        return $this->attendance_status === self::ATTENDANCE_OPEN;
    }

    public function getScanUrl(): ?string
    {
        if (! $this->qr_token) {
            return null;
        }

        return url("/attendance/scan/{$this->id}/{$this->qr_token}");
    }

    /**
     * Notify expected SB members that a session has been created.
     */
    public function notifyExpectedMembers(): void
    {
        $memberIds = $this->getExpectedMemberIds();

        if ($memberIds->isEmpty()) {
            return;
        }

        $users = User::query()->whereIn('id', $memberIds)->get();

        foreach ($users as $user) {
            $user->notify(new \App\Notifications\SessionCreatedNotification($this));
        }
    }
}
