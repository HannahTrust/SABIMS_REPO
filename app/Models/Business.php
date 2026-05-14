<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    public const STATUS_CLOSED = 'closed';

    public const STATUS_SUSPENDED = 'suspended';

    public const STATUS_PENDING = 'pending';

    /** @var list<string> */
    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_INACTIVE,
        self::STATUS_CLOSED,
        self::STATUS_SUSPENDED,
        self::STATUS_PENDING,
    ];

    public const TYPE_SINGLE_PROPRIETORSHIP = 'single_proprietorship';

    public const TYPE_PARTNERSHIP = 'partnership';

    public const TYPE_CORPORATION = 'corporation';

    /** @var list<string> */
    public const BUSINESS_TYPES = [
        self::TYPE_SINGLE_PROPRIETORSHIP,
        self::TYPE_PARTNERSHIP,
        self::TYPE_CORPORATION,
    ];

    protected $fillable = [
        'barangay_id',
        'purok_id',
        'business_category_id',
        'business_name',
        'business_code',
        'owner_resident_id',
        'owner_name',
        'owner_contact',
        'owner_email',
        'business_type',
        'address',
        'business_description',
        'date_started',
        'permit_number',
        'permit_issue_date',
        'permit_expiration_date',
        'status',
        'monthly_income_estimate',
        'latitude',
        'longitude',
        'logo_path',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'date_started' => 'date',
            'permit_issue_date' => 'date',
            'permit_expiration_date' => 'date',
            'monthly_income_estimate' => 'decimal:2',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(BusinessCategory::class, 'business_category_id');
    }

    public function primaryOwnerResident(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'owner_resident_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BusinessDocument::class);
    }

    public function owners(): HasMany
    {
        return $this->hasMany(BusinessOwner::class);
    }

    public function clearances(): HasMany
    {
        return $this->hasMany(BusinessClearance::class);
    }

    public function isClosed(): bool
    {
        return $this->status === self::STATUS_CLOSED;
    }

    public function isPermitExpired(): bool
    {
        if ($this->permit_expiration_date === null) {
            return false;
        }

        return $this->permit_expiration_date->isPast();
    }
}
