<?php

namespace Modules\Blotter\Models;

use App\Models\Barangay;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlotterReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'blotter_reports';

    protected $fillable = [
        'barangay_id',
        'purok_id',
        'blotter_number',
        'incident_type_id',
        'complainant_id',
        'respondent_id',
        'respondent_name',
        'incident_datetime',
        'incident_location',
        'narrative',
        'action_taken',
        'remarks',
        'assigned_to',
        'status',
        'settlement_date',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'incident_datetime' => 'datetime',
            'settlement_date' => 'date',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function incidentType(): BelongsTo
    {
        return $this->belongsTo(IncidentType::class);
    }

    public function complainant(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'complainant_id');
    }

    public function respondent(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'respondent_id');
    }

    public function assignedOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function witnesses(): HasMany
    {
        return $this->hasMany(BlotterWitness::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(BlotterAttachment::class);
    }
}
