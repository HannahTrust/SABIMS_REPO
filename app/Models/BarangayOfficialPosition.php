<?php

namespace App\Models;

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
}
