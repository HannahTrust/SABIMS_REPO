<?php

namespace App\Http\Controllers\BusinessRegistry;

use App\Http\Controllers\Controller;
use App\Http\Requests\BusinessRegistry\GenerateClearanceRequest;
use App\Models\Business;
use App\Models\BusinessClearance;
use App\Services\BusinessRegistryService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClearanceController extends Controller
{
    public function __construct(
        protected BusinessRegistryService $registry
    ) {}

    public function store(GenerateClearanceRequest $request, Business $business): RedirectResponse
    {
        try {
            $clearance = $this->registry->generateClearance(
                $business,
                $request->user(),
                [
                    'expiration_date' => $request->input('expiration_date'),
                    'remarks' => $request->input('remarks'),
                ],
                $request->ip()
            );
        } catch (\RuntimeException $e) {
            return redirect()
                ->back()
                ->withErrors(['clearance' => $e->getMessage()]);
        }

        return redirect()
            ->back()
            ->with('status', __('Clearance :num issued.', ['num' => $clearance->clearance_number]));
    }

    public function print(BusinessClearance $clearance): Response
    {
        $clearance->load([
            'business.category:id,name',
            'business.barangay:id,name,code',
            'business.purok:id,name',
            'issuer:id,name',
        ]);

        $this->authorize('view', $clearance->business);

        return Inertia::render('BusinessRegistry/Clearances/Print', [
            'clearance' => $clearance,
            'business' => $clearance->business,
            'printed_at' => now()->toIso8601String(),
        ]);
    }
}
