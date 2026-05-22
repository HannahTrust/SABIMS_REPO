<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Municipality extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'system_name',
        'module_name',
        'logo_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function barangays(): HasMany
    {
        return $this->hasMany(Barangay::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo_path === null || $this->logo_path === '') {
            return null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    /**
     * @return array<string, mixed>
     */
    public function toBrandingArray(): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'system_name' => $this->system_name,
            'module_name' => $this->module_name,
            'logo_url' => $this->logo_url,
        ];
    }
}
