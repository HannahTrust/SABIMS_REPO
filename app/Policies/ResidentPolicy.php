<?php

namespace App\Policies;

use App\Models\Resident;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCensusScope;

class ResidentPolicy
{
    use AuthorizesCensusScope;

    public function viewAny(User $user): bool
    {
        return $user->can('resident.view');
    }

    public function view(User $user, Resident $resident): bool
    {
        if (! $user->can('resident.view')) {
            return false;
        }

        return $this->residentVisibleToUser($user, $resident);
    }

    public function create(User $user): bool
    {
        return $user->can('resident.create');
    }

    public function update(User $user, Resident $resident): bool
    {
        if (! $user->can('resident.update')) {
            return false;
        }

        return $this->residentVisibleToUser($user, $resident);
    }
}
