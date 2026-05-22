<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateMunicipalityBrandingRequest;
use App\Models\Municipality;
use App\Services\MunicipalityManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MunicipalityBrandingController extends Controller
{
    public function __construct(
        protected MunicipalityManagementService $municipalityService
    ) {}

    public function edit(Request $request): Response
    {
        $municipality = $this->resolveMunicipalityForUser($request);

        $this->authorize('updateBranding', $municipality);

        return Inertia::render('settings/municipality', [
            'municipality' => [
                'id' => $municipality->id,
                'name' => $municipality->name,
                'system_name' => $municipality->system_name,
                'module_name' => $municipality->module_name,
                'logo_url' => $municipality->logo_url,
            ],
        ]);
    }

    public function update(UpdateMunicipalityBrandingRequest $request): RedirectResponse
    {
        $municipality = $this->resolveMunicipalityForUser($request);

        $this->authorize('updateBranding', $municipality);

        $data = $request->only(['system_name', 'module_name']);

        $this->municipalityService->update($municipality, $data, $request->file('logo'));

        logActivity(
            'update',
            'municipality_branding',
            $municipality->id,
            "Updated municipality branding: {$municipality->name}",
        );

        return redirect()
            ->route('municipality-settings.edit')
            ->with('status', 'Municipality branding updated successfully.');
    }

    private function resolveMunicipalityForUser(Request $request): Municipality
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $municipality = $user->resolveMunicipality();

        if (! $municipality) {
            abort(403, 'No municipality is associated with your account.');
        }

        return $municipality;
    }
}
