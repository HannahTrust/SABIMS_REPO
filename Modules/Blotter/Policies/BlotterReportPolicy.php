<?php

namespace Modules\Blotter\Policies;

use App\Models\User;
use Modules\Blotter\Models\BlotterReport;
use Modules\Blotter\Policies\Concerns\AuthorizesBlotterScope;

class BlotterReportPolicy
{
    use AuthorizesBlotterScope;

    public function before(User $user, string $ability): ?bool
    {
        return $this->isSuperAdmin($user) ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'view_blotter');
    }

    public function view(User $user, BlotterReport $report): bool
    {
        if (! $this->hasPermission($user, 'view_blotter') || ! $this->belongsToSameBarangay($user, $report)) {
            return false;
        }

        if ($this->isPurokLeader($user)) {
            return $this->canAccessPurok($user, $report) || (int) $report->created_by === (int) $user->id;
        }

        return true;
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create_blotter');
    }

    public function update(User $user, BlotterReport $report): bool
    {
        if (! $this->hasPermission($user, 'update_blotter') || ! $this->belongsToSameBarangay($user, $report)) {
            return false;
        }

        return $report->status !== 'archived';
    }

    public function resolve(User $user, BlotterReport $report): bool
    {
        if (! $this->hasPermission($user, 'resolve_blotter') || ! $this->belongsToSameBarangay($user, $report)) {
            return false;
        }

        if ($this->isLuponOfficer($user)) {
            return (int) $report->assigned_to === (int) $user->id || $report->status === 'under_mediation';
        }

        return true;
    }

    public function archive(User $user, BlotterReport $report): bool
    {
        if (! $this->hasPermission($user, 'archive_blotter') || ! $this->belongsToSameBarangay($user, $report)) {
            return false;
        }

        return $report->status !== 'archived';
    }

    public function print(User $user, BlotterReport $report): bool
    {
        return $this->view($user, $report) && $this->hasPermission($user, 'print_blotter');
    }

    public function delete(User $user, BlotterReport $report): bool
    {
        if (! $this->belongsToSameBarangay($user, $report)) {
            return false;
        }

        return $this->hasPermission($user, 'archive_blotter') && ! in_array($report->status, ['resolved', 'archived'], true);
    }

    private function hasPermission(User $user, string $permission): bool
    {
        return $user->hasPermissionTo($permission, 'web');
    }
}
