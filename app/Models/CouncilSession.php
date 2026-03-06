<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CouncilSession extends Model
{
    protected $table = 'council_sessions';

    /** @var list<string> */
    protected $fillable = [
        'session_date',
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
            $sbMemberIds = User::query()
                ->where('role', 'sb_member')
                ->pluck('id');

            if ($sbMemberIds->isEmpty()) {
                return;
            }

            $now = now();
            $rows = $sbMemberIds->map(fn (int $userId): array => [
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

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'session_id');
    }

    public function resolutions(): HasMany
    {
        return $this->hasMany(Resolution::class, 'session_id');
    }
}
