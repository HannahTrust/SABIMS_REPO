<?php

namespace App\Policies;

use App\Models\Municipality;
use App\Models\User;
use App\Policies\Concerns\AuthorizesMunicipalityScope;

class MunicipalityPolicy
{
    use AuthorizesMunicipalityScope;

    public function viewAny(User $user): bool
    {
        return $user->isPlatformAdmin();
    }

    public function view(User $user, Municipality $municipality): bool
    {
        return $this->managesMunicipality($user, $municipality);
    }

    public function create(User $user): bool
    {
        return $user->isPlatformAdmin();
    }

    public function update(User $user, Municipality $municipality): bool
    {
        return $this->managesMunicipality($user, $municipality);
    }

    public function delete(User $user, Municipality $municipality): bool
    {
        return $user->isPlatformAdmin();
    }

    /**
     * Municipal admin may edit branding only (not code / is_active).
     */
    public function updateBranding(User $user, Municipality $municipality): bool
    {
        return $this->managesMunicipality($user, $municipality);
    }
}
