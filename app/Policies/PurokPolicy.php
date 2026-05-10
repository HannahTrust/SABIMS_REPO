<?php

namespace App\Policies;

use App\Models\Barangay;
use App\Models\Purok;
use App\Models\User;
use App\Policies\Concerns\AuthorizesBarangayScope;

class PurokPolicy
{
    use AuthorizesBarangayScope;

    public function viewAny(User $user): bool
    {
        return $user->can('purok.view');
    }

    public function create(User $user, Barangay $barangay): bool
    {
        if (! $user->can('purok.create')) {
            return false;
        }

        return $this->managesBarangay($user, $barangay);
    }

    public function update(User $user, Purok $purok): bool
    {
        if (! $user->can('purok.update')) {
            return false;
        }

        return $this->managesBarangay($user, $purok->barangay);
    }

    public function delete(User $user, Purok $purok): bool
    {
        if (! $user->can('purok.delete')) {
            return false;
        }

        return $this->managesBarangay($user, $purok->barangay);
    }
}
