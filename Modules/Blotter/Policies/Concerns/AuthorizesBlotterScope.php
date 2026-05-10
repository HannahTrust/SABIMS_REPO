<?php

namespace Modules\Blotter\Policies\Concerns;

use App\Models\User;
use Modules\Blotter\Models\BlotterReport;

trait AuthorizesBlotterScope
{
    protected function isSuperAdmin(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    protected function belongsToSameBarangay(User $user, BlotterReport $report): bool
    {
        return (int) $user->barangay_id === (int) $report->barangay_id;
    }

    protected function isPurokLeader(User $user): bool
    {
        return $user->hasRole('purok_leader');
    }

    protected function isLuponOfficer(User $user): bool
    {
        return $user->hasRole('lupon_officer');
    }

    protected function canAccessPurok(User $user, BlotterReport $report): bool
    {
        if (! isset($user->purok_id) || $user->purok_id === null) {
            return false;
        }

        return (int) $user->purok_id === (int) $report->purok_id;
    }
}
