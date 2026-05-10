<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarangayOfficial extends Model
{
    use HasFactory;

    protected $fillable = [
        'barangay_id',
        'resident_id',
        'user_id',
        'official_position_id',
        'full_name',
        'contact_number',
        'email',
        'term_start',
        'term_end',
        'is_current',
        'photo_path',
        'signature_path',
    ];

    protected function casts(): array
    {
        return [
            'term_start' => 'date',
            'term_end' => 'date',
            'is_current' => 'boolean',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    /**
     * Linked resident profile (users.role = resident), when applicable.
     */
    public function residentProfile(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resident_id');
    }

    /**
     * Linked system user account (e.g. captain login), when applicable.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(BarangayOfficialPosition::class, 'official_position_id');
    }
}
