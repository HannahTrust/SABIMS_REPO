<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Purok extends Model
{
    use HasFactory;

    protected $fillable = [
        'barangay_id',
        'name',
        'code',
        'description',
        'purok_leader_user_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    /**
     * Assigned purok leader (system user), when linked.
     */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'purok_leader_user_id');
    }

    /**
     * Residents registered under this purok (via users.purok_id).
     */
    public function residents(): HasMany
    {
        return $this->hasMany(User::class, 'purok_id')
            ->where('role', 'resident');
    }
}
