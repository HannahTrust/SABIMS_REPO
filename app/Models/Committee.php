<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Committee extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'chair_id',
        'created_by',
    ];

    /**
     * Get the users who are members of the committee (pivot includes is_chair).
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'committee_user')
            ->withPivot('is_chair')
            ->withTimestamps();
    }

    /**
     * Get the resolutions under this committee.
     */
    public function resolutions(): HasMany
    {
        return $this->hasMany(Resolution::class);
    }

    /**
     * Get the user who chairs the committee.
     */
    public function chair(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chair_id');
    }

    /**
     * Get the user who created the committee.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
