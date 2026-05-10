<?php

namespace App\Policies;

use App\Models\Barangay;
use App\Models\BarangayOfficial;
use App\Models\User;
use App\Policies\Concerns\AuthorizesBarangayScope;

class BarangayOfficialPolicy
{
    use AuthorizesBarangayScope;

    public function viewAny(User $user): bool
    {
        return $user->can('official.view');
    }

    public function create(User $user, Barangay $barangay): bool
    {
        if (! $user->can('official.create')) {
            return false;
        }

        return $this->managesBarangay($user, $barangay);
    }

    public function update(User $user, BarangayOfficial $official): bool
    {
        if (! $user->can('official.update')) {
            return false;
        }

        return $this->managesBarangay($user, $official->barangay);
    }

    /**
     * Setting current flag, linking accounts, ending terms.
     */
    public function assign(User $user, BarangayOfficial $official): bool
    {
        if (! $user->can('official.assign')) {
            return false;
        }

        return $this->managesBarangay($user, $official->barangay);
    }
}
