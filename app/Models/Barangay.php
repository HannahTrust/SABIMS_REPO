<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barangay extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'municipality',
        'province',
        'region',
        'logo_path',
        'address',
        'contact_number',
        'email',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * All users belonging to this barangay (roles assigned at user level).
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function puroks(): HasMany
    {
        return $this->hasMany(Purok::class);
    }

    public function officials(): HasMany
    {
        return $this->hasMany(BarangayOfficial::class);
    }

    /**
     * Convenience scope: resident-role users under this barangay.
     */
    public function residents(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'resident');
    }

    /**
     * Census population records (central residents DB).
     */
    public function populationResidents(): HasMany
    {
        return $this->hasMany(Resident::class);
    }

    public function households(): HasMany
    {
        return $this->hasMany(Household::class);
    }

    public function residentImportLogs(): HasMany
    {
        return $this->hasMany(ResidentImportLog::class);
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class);
    }
}
