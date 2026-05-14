<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Census / central population record for a barangay (distinct from {@see ResidentUser} login accounts).
 */
class Resident extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    public const STATUS_DECEASED = 'deceased';

    public const STATUS_TRANSFERRED = 'transferred';

    /** @var list<string> */
    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_INACTIVE,
        self::STATUS_DECEASED,
        self::STATUS_TRANSFERRED,
    ];

    protected $fillable = [
        'barangay_id',
        'purok_id',
        'household_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'birth_date',
        'age',
        'gender',
        'civil_status',
        'nationality',
        'contact_number',
        'email',
        'occupation',
        'educational_attainment',
        'voter_status',
        'senior_citizen',
        'pwd_status',
        'profile_photo',
        'status',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'age' => 'integer',
            'voter_status' => 'boolean',
            'senior_citizen' => 'boolean',
            'pwd_status' => 'boolean',
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

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * When this resident is recorded as the head of a household (via households.household_head_resident_id).
     */
    public function headedHousehold(): HasOne
    {
        return $this->hasOne(Household::class, 'household_head_resident_id');
    }

    /**
     * Businesses where this resident is the primary listed owner (businesses.owner_resident_id).
     */
    public function ownedBusinesses(): HasMany
    {
        return $this->hasMany(Business::class, 'owner_resident_id');
    }

    /**
     * Co-owner / additional owner rows linked to this resident.
     */
    public function businessOwnerships(): HasMany
    {
        return $this->hasMany(BusinessOwner::class);
    }
}
