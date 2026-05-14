<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\User;
use App\Policies\Concerns\AuthorizesBusinessScope;

class BusinessPolicy
{
    use AuthorizesBusinessScope;

    public function viewAny(User $user): bool
    {
        return $user->can('business.view');
    }

    public function view(User $user, Business $business): bool
    {
        if (! $user->can('business.view')) {
            return false;
        }

        return $this->businessVisibleToUser($user, $business);
    }

    public function create(User $user): bool
    {
        if (! $user->can('business.create')) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        $role = User::normalizeRole($user->role ?? '');

        return $user->barangay_id !== null
            && in_array($role, ['brgy_admin', 'brgy_secretary'], true);
    }

    public function update(User $user, Business $business): bool
    {
        if (! $user->can('business.update')) {
            return false;
        }

        return $this->businessVisibleToUser($user, $business)
            && $this->allowStructureEdit($user);
    }

    public function delete(User $user, Business $business): bool
    {
        if (! $user->can('business.delete')) {
            return false;
        }

        return $this->businessVisibleToUser($user, $business)
            && $this->allowStructureEdit($user);
    }

    public function renewPermit(User $user, Business $business): bool
    {
        if (! $user->can('business.permit.renew')) {
            return false;
        }

        return $this->businessVisibleToUser($user, $business);
    }

    public function generateClearance(User $user, Business $business): bool
    {
        if (! $user->can('business.clearance.generate')) {
            return false;
        }

        return $this->businessVisibleToUser($user, $business);
    }

    public function uploadDocuments(User $user, Business $business): bool
    {
        return $this->update($user, $business);
    }

    protected function allowStructureEdit(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $role = User::normalizeRole($user->role ?? '');

        return in_array($role, ['brgy_admin', 'brgy_secretary'], true);
    }
}
