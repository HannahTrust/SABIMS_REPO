<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Http\Requests\Platform\StoreMunicipalityRequest;
use App\Http\Requests\Platform\UpdateMunicipalityRequest;
use App\Models\Municipality;
use App\Services\MunicipalityManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MunicipalityController extends Controller
{
    public function __construct(
        protected MunicipalityManagementService $municipalityService
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Municipality::class);

        $search = trim((string) $request->query('search', ''));

        $tenants = Municipality::query()
            ->withCount('barangays')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('system_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Platform/Tenants/Index', [
            'tenants' => collect($tenants->items())->map(fn (Municipality $m) => $this->toListProps($m))->values()->all(),
            'pagination' => [
                'current_page' => $tenants->currentPage(),
                'last_page' => $tenants->lastPage(),
                'per_page' => $tenants->perPage(),
                'total' => $tenants->total(),
                'from' => $tenants->firstItem(),
                'to' => $tenants->lastItem(),
                'prev_url' => $tenants->previousPageUrl(),
                'next_url' => $tenants->nextPageUrl(),
            ],
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Municipality::class);

        return Inertia::render('Platform/Tenants/Create');
    }

    public function store(StoreMunicipalityRequest $request): RedirectResponse
    {
        $this->authorize('create', Municipality::class);

        $data = $request->validated();
        unset($data['logo']);
        $data['is_active'] = $request->boolean('is_active', true);

        $municipality = $this->municipalityService->create($data, $request->file('logo'));

        logActivity(
            'create',
            'municipality',
            $municipality->id,
            "Created tenant municipality: {$municipality->name} ({$municipality->code})",
        );

        return redirect()
            ->route('platform.tenants.index')
            ->with('status', 'Tenant municipality created successfully.');
    }

    public function edit(Municipality $municipality): Response
    {
        $this->authorize('update', $municipality);

        return Inertia::render('Platform/Tenants/Edit', [
            'tenant' => $this->toDetailProps($municipality),
        ]);
    }

    public function update(UpdateMunicipalityRequest $request, Municipality $municipality): RedirectResponse
    {
        $this->authorize('update', $municipality);

        $data = $request->validated();
        unset($data['logo']);
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        $this->municipalityService->update($municipality, $data, $request->file('logo'));

        logActivity(
            'update',
            'municipality',
            $municipality->id,
            "Updated tenant municipality: {$municipality->name} ({$municipality->code})",
        );

        return redirect()
            ->route('platform.tenants.index')
            ->with('status', 'Tenant municipality updated successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    private function toListProps(Municipality $municipality): array
    {
        return [
            'id' => $municipality->id,
            'code' => $municipality->code,
            'name' => $municipality->name,
            'system_name' => $municipality->system_name,
            'module_name' => $municipality->module_name,
            'logo_url' => $municipality->logo_url,
            'is_active' => $municipality->is_active,
            'barangays_count' => $municipality->barangays_count ?? 0,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function toDetailProps(Municipality $municipality): array
    {
        return [
            'id' => $municipality->id,
            'code' => $municipality->code,
            'name' => $municipality->name,
            'system_name' => $municipality->system_name,
            'module_name' => $municipality->module_name,
            'logo_url' => $municipality->logo_url,
            'is_active' => $municipality->is_active,
        ];
    }
}
