<?php

namespace App\Policies\Concerns;

use App\Models\Barangay;
use App\Models\Resident;
use App\Models\User;

trait AuthorizesCensusScope
{
    protected function managesBarangayCensus(User $user, Barangay $barangay): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->barangay_id === null) {
            return false;
        }

        if ((int) $user->barangay_id !== (int) $barangay->id) {
            return false;
        }

        $role = User::normalizeRole($user->role ?? '');

        return in_array($role, ['brgy_admin', 'brgy_secretary'], true);
    }

    protected function canViewBarangayCensus(User $user, Barangay $barangay): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->barangay_id === null) {
            return false;
        }

        if ((int) $user->barangay_id !== (int) $barangay->id) {
            return false;
        }

        $role = User::normalizeRole($user->role ?? '');

        return in_array($role, ['brgy_admin', 'brgy_secretary', 'purok_leader'], true);
    }

    protected function residentVisibleToUser(User $user, Resident $resident): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->barangay_id === null || (int) $user->barangay_id !== (int) $resident->barangay_id) {
            return false;
        }

        $role = User::normalizeRole($user->role ?? '');

        if (in_array($role, ['brgy_admin', 'brgy_secretary'], true)) {
            return true;
        }

        return $role === 'purok_leader'
            && $user->purok_id !== null
            && (int) $user->purok_id === (int) $resident->purok_id;
    }
}
