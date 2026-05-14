<?php

namespace App\Policies;

use App\Models\ResidentImportLog;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCensusScope;

class ResidentImportLogPolicy
{
    use AuthorizesCensusScope;

    public function viewAny(User $user): bool
    {
        return $user->can('resident.import');
    }

    public function create(User $user): bool
    {
        return $user->can('resident.import');
    }

    public function view(User $user, ResidentImportLog $log): bool
    {
        if (! $user->can('resident.import')) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $this->managesBarangayCensus($user, $log->barangay);
    }

    public function commit(User $user, ResidentImportLog $log): bool
    {
        if (! $user->can('resident.import')) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $this->managesBarangayCensus($user, $log->barangay);
    }

    public function downloadErrors(User $user, ResidentImportLog $log): bool
    {
        return $this->view($user, $log);
    }
}
