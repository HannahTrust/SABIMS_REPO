<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Resolution extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'resolution_number',
        'title',
        'description',
        'session_id',
        'committee_id',
        'status',
        'visibility',
        'voting_result',
        'file_path',
        'year',
        'created_by',
    ];

    public const VISIBILITY_PRIVATE = 'private';
    public const VISIBILITY_PUBLIC = 'public';

    public const STATUS_DRAFT = 'draft';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_ARCHIVED = 'archived';

    public static function statuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_APPROVED,
            self::STATUS_ARCHIVED,
        ];
    }

    public static function visibilities(): array
    {
        return [self::VISIBILITY_PRIVATE, self::VISIBILITY_PUBLIC];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(CouncilSession::class, 'session_id');
    }

    public function committee(): BelongsTo
    {
        return $this->belongsTo(Committee::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
