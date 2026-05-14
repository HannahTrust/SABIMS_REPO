<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessDocument extends Model
{
    use HasFactory;

    public const TYPE_DTI_PERMIT = 'dti_permit';

    public const TYPE_SEC_REGISTRATION = 'sec_registration';

    public const TYPE_BARANGAY_CLEARANCE = 'barangay_clearance';

    public const TYPE_MAYORS_PERMIT = 'mayors_permit';

    public const TYPE_BIR_REGISTRATION = 'bir_registration';

    /** @var list<string> */
    public const DOCUMENT_TYPES = [
        self::TYPE_DTI_PERMIT,
        self::TYPE_SEC_REGISTRATION,
        self::TYPE_BARANGAY_CLEARANCE,
        self::TYPE_MAYORS_PERMIT,
        self::TYPE_BIR_REGISTRATION,
    ];

    protected $fillable = [
        'business_id',
        'document_type',
        'file_path',
        'uploaded_by',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
