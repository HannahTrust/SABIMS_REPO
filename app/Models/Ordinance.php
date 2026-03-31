<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ordinance extends Model
{
    use SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_REVIEWED = 'reviewed';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_ARCHIVED = 'archived';

    /** @var list<string> */
    protected $fillable = [
        'title',
        'ordinance_number',
        'description',
        'committee_id',
        'session_id',
        'status',
        'file_path',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    /** @return list<string> */
    public static function statuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_REVIEWED,
            self::STATUS_APPROVED,
            self::STATUS_ARCHIVED,
        ];
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }

    public function committee(): BelongsTo
    {
        return $this->belongsTo(Committee::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(CouncilSession::class, 'session_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isEditable(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_REVIEWED], true);
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }
}

