<?php

namespace App\Http\Controllers\BusinessRegistry;

use App\Http\Controllers\Controller;
use App\Http\Requests\BusinessRegistry\RenewPermitRequest;
use App\Models\Business;
use App\Services\BusinessRegistryService;
use Illuminate\Http\RedirectResponse;

class PermitController extends Controller
{
    public function __construct(
        protected BusinessRegistryService $registry
    ) {}

    public function renew(RenewPermitRequest $request, Business $business): RedirectResponse
    {
        $this->registry->renewPermit(
            $business,
            $request->permitPayload(),
            $request->user(),
            $request->ip()
        );

        return redirect()
            ->back()
            ->with('status', __('Permit renewed.'));
    }
}
