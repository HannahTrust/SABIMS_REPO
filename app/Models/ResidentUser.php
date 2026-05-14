<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

/**
 * System user account with the {@see User::$role} {@code resident} (login/access).
 * Distinct from census {@see Resident} records in the {@code residents} table.
 */
class ResidentUser extends User
{
    protected $table = 'users';

    protected static function booted(): void
    {
        static::addGlobalScope('resident_role', function (Builder $builder): void {
            $builder->where('role', 'resident');
        });
    }
}
