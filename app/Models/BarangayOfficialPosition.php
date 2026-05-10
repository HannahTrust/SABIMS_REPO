<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BarangayOfficialPosition extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'hierarchy_level',
    ];

    protected function casts(): array
    {
        return [
            'hierarchy_level' => 'integer',
        ];
    }

    public function officials(): HasMany
    {
        return $this->hasMany(BarangayOfficial::class, 'official_position_id');
    }

    public function isCaptain(): bool
    {
        return $this->code === 'captain';
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeCaptain($query)
    {
        return $query->where('code', 'captain');
    }
}
