<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBarangayRequest;
use App\Http\Requests\UpdateBarangayRequest;
use App\Models\Barangay;
use App\Services\BarangayManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BarangayController extends Controller
{
    public function __construct(
        protected BarangayManagementService $barangayManagementService
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Barangay::class);

        $user = $request->user();

        $query = Barangay::query()
            ->withCount([
                'users as residents_count' => fn ($q) => $q->where('role', 'resident'),
                'puroks',
                'officials as current_officials_count' => fn ($q) => $q->where('is_current', true),
            ]);

        if ($user && $user->hasRole('brgy_admin') && ! $user->isSuperAdmin()) {
            $query->where('id', $user->barangay_id);
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('municipality', 'like', "%{$search}%");
            });
        }

        $municipality = trim((string) $request->query('municipality', ''));
        if ($municipality !== '') {
            $query->where('municipality', $municipality);
        }

        $status = trim((string) $request->query('status', ''));
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $barangays = $query
            ->orderBy('municipality')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $municipalities = Barangay::query()
            ->whereNotNull('municipality')
            ->where('municipality', '!=', '')
            ->distinct()
            ->orderBy('municipality')
            ->pluck('municipality')
            ->values()
            ->all();

        return Inertia::render('Management/Barangays/Index', [
            'barangays' => collect($barangays->items())->map(fn (Barangay $b) => $this->toBarangayListProps($b))->values()->all(),
            'pagination' => [
                'current_page' => $barangays->currentPage(),
                'last_page' => $barangays->lastPage(),
                'per_page' => $barangays->perPage(),
                'total' => $barangays->total(),
                'from' => $barangays->firstItem(),
                'to' => $barangays->lastItem(),
                'prev_url' => $barangays->previousPageUrl(),
                'next_url' => $barangays->nextPageUrl(),
            ],
            'filters' => [
                'search' => $search,
                'municipality' => $municipality,
                'status' => $status,
            ],
            'municipalities' => $municipalities,
            'can' => [
                'create' => $request->user()?->can('barangay.create') ?? false,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Barangay::class);

        return Inertia::render('Management/Barangays/Create', []);
    }

    public function store(StoreBarangayRequest $request): RedirectResponse
    {
        $this->authorize('create', Barangay::class);

        $data = $request->validated();
        unset($data['logo']);
        $data['is_active'] = $request->boolean('is_active', true);

        $barangay = $this->barangayManagementService->createBarangay(
            $data,
            $request->file('logo')
        );

        return redirect()
            ->route('management.barangays.edit', $barangay)
            ->with('status', 'Barangay created.');
    }

    public function edit(Request $request, Barangay $barangay): Response
    {
        $this->authorize('view', $barangay);

        $stats = $this->barangayManagementService->getBarangayStatistics($barangay);

        return Inertia::render('Management/Barangays/Edit', [
            'barangay' => $this->toBarangayFormProps($barangay),
            'stats' => $stats,
            'can' => [
                'update' => $request->user()?->can('barangay.update') ?? false,
                'delete' => $request->user()?->can('barangay.delete') ?? false,
            ],
        ]);
    }

    public function update(UpdateBarangayRequest $request, Barangay $barangay): RedirectResponse
    {
        $this->authorize('update', $barangay);

        $data = $request->validated();
        unset($data['logo']);
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        $this->barangayManagementService->updateBarangay($barangay, $data, $request->file('logo'));

        return redirect()
            ->route('management.barangays.edit', $barangay)
            ->with('status', 'Barangay updated.');
    }

    public function destroy(Request $request, Barangay $barangay): RedirectResponse
    {
        $this->authorize('delete', $barangay);

        $barangay->delete();

        return redirect()
            ->route('management.barangays.index')
            ->with('status', 'Barangay deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function toBarangayListProps(Barangay $b): array
    {
        return [
            'id' => $b->id,
            'code' => $b->code,
            'name' => $b->name,
            'municipality' => $b->municipality,
            'province' => $b->province,
            'region' => $b->region,
            'is_active' => $b->is_active,
            'residents_count' => (int) ($b->residents_count ?? 0),
            'puroks_count' => (int) ($b->puroks_count ?? 0),
            'current_officials_count' => (int) ($b->current_officials_count ?? 0),
            'logo_url' => $b->logo_path ? Storage::disk('public')->url($b->logo_path) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function toBarangayFormProps(Barangay $b): array
    {
        return [
            'id' => $b->id,
            'code' => $b->code,
            'name' => $b->name,
            'municipality' => $b->municipality,
            'province' => $b->province,
            'region' => $b->region,
            'address' => $b->address,
            'contact_number' => $b->contact_number,
            'email' => $b->email,
            'is_active' => $b->is_active,
            'logo_url' => $b->logo_path ? Storage::disk('public')->url($b->logo_path) : null,
        ];
    }
}
