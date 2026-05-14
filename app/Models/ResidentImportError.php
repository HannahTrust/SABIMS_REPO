<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResidentImportError extends Model
{
    use HasFactory;

    protected $fillable = [
        'import_log_id',
        'row_number',
        'error_message',
        'raw_data',
    ];

    protected function casts(): array
    {
        return [
            'row_number' => 'integer',
            'raw_data' => 'array',
        ];
    }

    public function importLog(): BelongsTo
    {
        return $this->belongsTo(ResidentImportLog::class, 'import_log_id');
    }
}
