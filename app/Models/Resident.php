<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Resident extends User
{
    protected $table = 'users';

    protected static function booted(): void
    {
        static::addGlobalScope('resident_role', function (Builder $builder): void {
            $builder->where('role', 'resident');
        });
    }
}
