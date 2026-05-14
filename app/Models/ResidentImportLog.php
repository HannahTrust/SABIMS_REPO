<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResidentImportLog extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_PREVIEW = 'preview';

    public const STATUS_VALIDATING = 'validating';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'barangay_id',
        'uploaded_by',
        'file_name',
        'storage_path',
        'total_rows',
        'successful_imports',
        'failed_imports',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'total_rows' => 'integer',
            'successful_imports' => 'integer',
            'failed_imports' => 'integer',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function errors(): HasMany
    {
        return $this->hasMany(ResidentImportError::class, 'import_log_id');
    }
}
