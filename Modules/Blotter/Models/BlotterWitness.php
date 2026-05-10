<?php

namespace Modules\Blotter\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlotterWitness extends Model
{
    use HasFactory;

    protected $table = 'blotter_witnesses';

    protected $fillable = [
        'blotter_report_id',
        'name',
        'contact',
        'statement',
    ];

    public function blotterReport(): BelongsTo
    {
        return $this->belongsTo(BlotterReport::class);
    }
}
