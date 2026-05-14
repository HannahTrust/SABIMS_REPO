<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Household extends Model
{
    use HasFactory;

    protected $fillable = [
        'barangay_id',
        'purok_id',
        'household_code',
        'household_head_resident_id',
        'address',
        'monthly_income',
        'housing_type',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'monthly_income' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function purok(): BelongsTo
    {
        return $this->belongsTo(Purok::class);
    }

    public function head(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'household_head_resident_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(Resident::class);
    }
}
