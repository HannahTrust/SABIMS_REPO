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
        'minutes_file',
        'created_by',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'session_date' => 'date',
        ];
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
