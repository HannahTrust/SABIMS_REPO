<?php

namespace Modules\Blotter\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlotterAttachment extends Model
{
    use HasFactory;

    protected $table = 'blotter_attachments';

    protected $fillable = [
        'blotter_report_id',
        'file_name',
        'file_path',
        'uploaded_by',
    ];

    public function blotterReport(): BelongsTo
    {
        return $this->belongsTo(BlotterReport::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
