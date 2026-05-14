<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessOwner extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'resident_id',
        'full_name',
        'contact_number',
        'email',
        'ownership_percentage',
    ];

    protected function casts(): array
    {
        return [
            'ownership_percentage' => 'integer',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }
}
