<?php

namespace App\Policies;

use App\Models\Household;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCensusScope;

class HouseholdPolicy
{
    use AuthorizesCensusScope;

    public function viewAny(User $user): bool
    {
        return $user->can('household.manage');
    }

    public function view(User $user, Household $household): bool
    {
        if (! $user->can('household.manage')) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->barangay_id === null || (int) $user->barangay_id !== (int) $household->barangay_id) {
            return false;
        }

        $role = User::normalizeRole($user->role ?? '');

        if (in_array($role, ['brgy_admin', 'brgy_secretary'], true)) {
            return true;
        }

        return $role === 'purok_leader'
            && $user->purok_id !== null
            && (int) $user->purok_id === (int) $household->purok_id;
    }

    public function create(User $user): bool
    {
        return $user->can('household.manage');
    }

    public function update(User $user, Household $household): bool
    {
        if (! $user->can('household.manage')) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $this->managesBarangayCensus($user, $household->barangay);
    }

    public function setHead(User $user, Household $household): bool
    {
        return $this->update($user, $household);
    }
}
