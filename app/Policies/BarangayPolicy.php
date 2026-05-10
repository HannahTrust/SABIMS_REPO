<?php

namespace App\Policies;

use App\Models\Barangay;
use App\Models\User;
use App\Policies\Concerns\AuthorizesBarangayScope;

class BarangayPolicy
{
    use AuthorizesBarangayScope;

    public function viewAny(User $user): bool
    {
        return $user->can('barangay.view');
    }

    public function view(User $user, Barangay $barangay): bool
    {
        if (! $user->can('barangay.view')) {
            return false;
        }

        return $this->managesBarangay($user, $barangay);
    }

    public function create(User $user): bool
    {
        return $user->can('barangay.create');
    }

    public function update(User $user, Barangay $barangay): bool
    {
        if (! $user->can('barangay.update')) {
            return false;
        }

        return $this->managesBarangay($user, $barangay);
    }

    public function delete(User $user, Barangay $barangay): bool
    {
        if (! $user->can('barangay.delete')) {
            return false;
        }

        return $this->managesBarangay($user, $barangay);
    }
}
