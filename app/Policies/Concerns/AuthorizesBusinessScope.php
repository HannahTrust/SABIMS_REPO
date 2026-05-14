<?php

namespace App\Policies\Concerns;

use App\Models\Business;
use App\Models\User;

trait AuthorizesBusinessScope
{
    protected function businessVisibleToUser(User $user, Business $business): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $role = User::normalizeRole($user->role ?? '');

        if (in_array($role, ['admin', 'vice_mayor'], true) && $user->can('business.view')) {
            return true;
        }

        if ($user->barangay_id === null) {
            return false;
        }

        if ((int) $user->barangay_id !== (int) $business->barangay_id) {
            return false;
        }

        if ($role === 'purok_leader') {
            return $user->purok_id !== null
                && (int) $user->purok_id === (int) $business->purok_id;
        }

        return in_array($role, ['brgy_admin', 'brgy_secretary', 'brgy_captain'], true);
    }

    protected function managesBusinessInBarangay(User $user, int $barangayId): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $role = User::normalizeRole($user->role ?? '');

        if ($user->barangay_id === null) {
            return false;
        }

        if ((int) $user->barangay_id !== $barangayId) {
            return false;
        }

        return in_array($role, ['brgy_admin', 'brgy_secretary'], true);
    }
}
