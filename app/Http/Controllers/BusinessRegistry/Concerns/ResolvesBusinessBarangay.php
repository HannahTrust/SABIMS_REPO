<?php

namespace App\Http\Controllers\BusinessRegistry\Concerns;

use App\Models\Barangay;
use App\Models\User;
use Illuminate\Http\Request;

trait ResolvesBusinessBarangay
{
    /**
     * Optional barangay filter for dashboards (super admin & municipal roles).
     */
    protected function optionalRegistryBarangay(Request $request): ?Barangay
    {
        $user = $request->user();
        if ($user === null) {
            return null;
        }

        if ($user->isSuperAdmin()) {
            $id = $request->integer('barangay_id');

            return $id > 0 ? Barangay::query()->find($id) : null;
        }

        $role = User::normalizeRole($user->role ?? '');
        if (in_array($role, ['admin', 'vice_mayor'], true)) {
            $id = $request->integer('barangay_id');

            return $id > 0 ? Barangay::query()->find($id) : null;
        }

        if ($user->barangay_id !== null) {
            return Barangay::query()->find($user->barangay_id);
        }

        return null;
    }

    /**
     * @return array<string, int>
     */
    protected function barangayQueryForRedirect(Request $request, ?int $barangayId = null): array
    {
        $user = $request->user();
        if ($user?->isSuperAdmin() || ($barangayId !== null && in_array(User::normalizeRole($user->role ?? ''), ['admin', 'vice_mayor'], true))) {
            if ($barangayId !== null && $barangayId > 0) {
                return ['barangay_id' => $barangayId];
            }
        }

        if ($user?->isSuperAdmin()) {
            return [];
        }

        return [];
    }

    /**
     * Barangay scope for listings: municipal/super admin may pass barangay_id; barangay staff are fixed to their barangay.
     */
    protected function restrictedBusinessBarangayId(Request $request): ?int
    {
        $user = $request->user();
        if ($user === null) {
            return null;
        }

        if ($user->isSuperAdmin()) {
            $id = $request->integer('barangay_id');

            return $id > 0 ? $id : null;
        }

        $role = User::normalizeRole($user->role ?? '');
        if (in_array($role, ['admin', 'vice_mayor'], true)) {
            $id = $request->integer('barangay_id');

            return $id > 0 ? $id : null;
        }

        return $user->barangay_id !== null ? (int) $user->barangay_id : null;
    }
}
