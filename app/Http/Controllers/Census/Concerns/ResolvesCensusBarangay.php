<?php

namespace App\Http\Controllers\Census\Concerns;

use App\Models\Barangay;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;

trait ResolvesCensusBarangay
{
    protected function censusBarangay(Request $request): Barangay
    {
        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        if ($user->isSuperAdmin()) {
            $id = $request->integer('barangay_id');
            if ($id < 1) {
                throw new HttpResponseException(
                    redirect()->route('residents.dashboard')->withErrors([
                        'barangay_id' => __('Choose a barangay first. Pick one from the filter on the Population dashboard, then open Residents or other census pages.'),
                    ])
                );
            }

            return Barangay::query()->findOrFail($id);
        }

        if ($user->barangay_id === null) {
            abort(403);
        }

        return Barangay::query()->findOrFail($user->barangay_id);
    }

    /**
     * Optional barangay for super admin (null when not passed).
     */
    protected function optionalCensusBarangay(Request $request): ?Barangay
    {
        $user = $request->user();
        if ($user === null) {
            return null;
        }

        if ($user->isSuperAdmin()) {
            $id = $request->integer('barangay_id');

            return $id > 0 ? Barangay::query()->find($id) : null;
        }

        return $user->barangay_id ? Barangay::query()->find($user->barangay_id) : null;
    }
}
