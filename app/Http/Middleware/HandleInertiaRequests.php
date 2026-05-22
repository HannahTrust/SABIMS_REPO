<?php

namespace App\Http\Middleware;

use App\Models\Municipality;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $municipality = $user?->resolveMunicipality();
        $branding = $this->brandingProps($municipality);

        return [
            ...parent::share($request),
            'name' => $branding['system_name'],
            'branding' => $branding,
            'auth' => [
                'user' => $user,
            ],
            'capabilities' => [
                'is_platform_admin' => (bool) $user?->isPlatformAdmin(),
                'is_municipal_admin' => (bool) $user?->isMunicipalAdmin(),
                'can_manage_tenants' => (bool) $user?->isPlatformAdmin(),
                'can_manage_municipality_branding' => (bool) ($user?->isMunicipalAdmin() || $user?->isPlatformAdmin()),
            ],
            'census' => [
                'can_view' => (bool) ($user?->can('resident.view')),
                'can_create' => (bool) ($user?->can('resident.create')),
                'can_update' => (bool) ($user?->can('resident.update')),
                'can_import' => (bool) ($user?->can('resident.import')),
                'can_manage_households' => (bool) ($user?->can('household.manage')),
            ],
            'business_registry' => [
                'can_view' => (bool) ($user?->can('business.view')),
                'can_create' => (bool) ($user?->can('business.create')),
                'can_update' => (bool) ($user?->can('business.update')),
                'can_delete' => (bool) ($user?->can('business.delete')),
                'can_renew_permit' => (bool) ($user?->can('business.permit.renew')),
                'can_generate_clearance' => (bool) ($user?->can('business.clearance.generate')),
            ],
            'notifications' => $user
                ? $user->unreadNotifications()->limit(10)->get()->map(fn ($n) => [
                    'id' => $n->id,
                    'type' => $n->type,
                    'data' => $n->data,
                    'read_at' => $n->read_at?->toIso8601String(),
                    'created_at' => $n->created_at->toIso8601String(),
                ])->values()->all()
                : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function brandingProps(?Municipality $municipality): array
    {
        if ($municipality !== null) {
            return [
                ...$municipality->toBrandingArray(),
                'municipality_name' => $municipality->name,
            ];
        }

        return [
            'id' => null,
            'code' => null,
            'name' => null,
            'municipality_name' => null,
            'system_name' => config('app.name', 'eBarangayHub'),
            'module_name' => 'SABIMS Module',
            'logo_url' => null,
        ];
    }
}
