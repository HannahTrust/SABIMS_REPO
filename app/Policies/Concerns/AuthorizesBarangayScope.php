<?php

namespace App\Policies\Concerns;

use App\Models\Barangay;
use App\Models\User;

trait AuthorizesBarangayScope
{
    protected function managesBarangay(User $user, Barangay $barangay): bool
    {
        if ($user->isPlatformAdmin()) {
            return true;
        }

        if ($user->isMunicipalAdmin()) {
            return $user->municipality_id !== null
                && (int) $user->municipality_id === (int) $barangay->municipality_id;
        }

        $normalized = User::normalizeRole($user->role ?? '');

        return $normalized === 'brgy_admin'
            && $user->barangay_id !== null
            && (int) $user->barangay_id === (int) $barangay->id;
    }
}
