<?php

namespace App\Policies\Concerns;

use App\Models\Municipality;
use App\Models\User;

trait AuthorizesMunicipalityScope
{
    protected function managesMunicipality(User $user, Municipality $municipality): bool
    {
        if ($user->isPlatformAdmin()) {
            return true;
        }

        return $user->isMunicipalAdmin()
            && (int) $user->municipality_id === (int) $municipality->id;
    }
}
