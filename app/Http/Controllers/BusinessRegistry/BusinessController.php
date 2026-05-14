<?php

namespace App\Http\Controllers\BusinessRegistry;

use App\Http\Controllers\BusinessRegistry\Concerns\ResolvesBusinessBarangay;
use App\Http\Controllers\Controller;
use App\Http\Requests\BusinessRegistry\StoreBusinessRequest;
use App\Http\Requests\BusinessRegistry\UpdateBusinessRequest;
use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\Purok;
use App\Models\Resident;
use App\Models\User;
use App\Services\BusinessRegistryService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BusinessController extends Controller
{
    use ResolvesBusinessBarangay;

    public function __construct(
        protected BusinessRegistryService $registry
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Business::class);

        $user = $request->user();
        $barangayId = $this->restrictedBusinessBarangayId($request);

        $query = Business::query()
            ->with([
                'category:id,name',
                'barangay:id,name',
                'purok:id,name',
                'primaryOwnerResident:id,first_name,middle_name,last_name',
            ]);

        if ($barangayId !== null) {
            $query->where('barangay_id', $barangayId);
        }

        if ($user && ! $user->isSuperAdmin() && $this->isPurokLeader($user)) {
            $query->where('purok_id', $user->purok_id);
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like): void {
                $q->where('business_name', 'like', $like)
                    ->orWhere('business_code', 'like', $like)
                    ->orWhere('owner_name', 'like', $like)
                    ->orWhere('permit_number', 'like', $like);
            });
        }

        if ($request->filled('business_category_id')) {
            $query->where('business_category_id', $request->integer('business_category_id'));
        }

        if ($request->filled('purok_id') && $barangayId !== null) {
            $query->where('purok_id', $request->integer('purok_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->query('status'));
        }

        if ($request->query('permit_filter') === 'expired') {
            $query->whereNotNull('permit_expiration_date')
                ->whereDate('permit_expiration_date', '<', now()->toDateString());
        } elseif ($request->query('permit_filter') === 'valid') {
            $query->where(function ($q): void {
                $q->whereNull('permit_expiration_date')
                    ->orWhereDate('permit_expiration_date', '>=', now()->toDateString());
            });
        } elseif ($request->query('permit_filter') === 'none') {
            $query->whereNull('permit_number')
                ->whereNull('permit_expiration_date');
        }

        $businesses = $this->registry->paginateFiltered($query, 20);

        $puroks = $barangayId !== null
            ? Purok::query()
                ->where('barangay_id', $barangayId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
            : collect();

        $categories = BusinessCategory::query()->active()->orderBy('name')->get(['id', 'name', 'code']);

        $barangayOptions = [];
        if ($user?->isSuperAdmin()) {
            $barangayOptions = Barangay::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (Barangay $b) => [
                    'id' => $b->id,
                    'name' => $b->name,
                    'code' => $b->code,
                ])->values()->all();
        }

        $role = $user ? User::normalizeRole($user->role ?? '') : null;
        if (in_array($role, ['admin', 'vice_mayor'], true)) {
            $barangayOptions = Barangay::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (Barangay $b) => [
                    'id' => $b->id,
                    'name' => $b->name,
                    'code' => $b->code,
                ])->values()->all();
        }

        $scopedBarangay = $barangayId !== null ? Barangay::query()->find($barangayId) : null;

        return Inertia::render('BusinessRegistry/Businesses/Index', [
            'barangay' => $scopedBarangay ? ['id' => $scopedBarangay->id, 'name' => $scopedBarangay->name] : null,
            'barangays' => $barangayOptions,
            'businesses' => $businesses,
            'puroks' => $puroks,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'business_category_id' => $request->query('business_category_id'),
                'purok_id' => $request->query('purok_id'),
                'status' => $request->query('status'),
                'permit_filter' => $request->query('permit_filter'),
                'barangay_id' => $request->query('barangay_id'),
            ],
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $this->authorize('create', Business::class);

        $user = $request->user();

        $barangayOptions = Barangay::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn (Barangay $b) => [
                'id' => $b->id,
                'name' => $b->name,
                'code' => $b->code,
            ])
            ->values()
            ->all();

        if ($user?->isSuperAdmin() && $request->integer('barangay_id') < 1) {
            return Inertia::render('BusinessRegistry/Businesses/Create', [
                'barangay' => null,
                'barangays' => $barangayOptions,
                'categories' => [],
                'puroks' => [],
                'residents' => [],
            ]);
        }

        $barangay = $user?->isSuperAdmin()
            ? Barangay::query()->findOrFail($request->integer('barangay_id'))
            : Barangay::query()->findOrFail((int) $user->barangay_id);

        $categories = BusinessCategory::query()->active()->orderBy('name')->get(['id', 'name', 'code']);
        $puroks = Purok::query()
            ->where('barangay_id', $barangay->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $residents = Resident::query()
            ->where('barangay_id', $barangay->id)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(400)
            ->get(['id', 'first_name', 'middle_name', 'last_name']);

        return Inertia::render('BusinessRegistry/Businesses/Create', [
            'barangay' => ['id' => $barangay->id, 'name' => $barangay->name],
            'barangays' => $barangayOptions,
            'categories' => $categories,
            'puroks' => $puroks,
            'residents' => $residents,
        ]);
    }

    public function store(StoreBusinessRequest $request): RedirectResponse
    {
        $attrs = $request->businessAttributes();
        if (($attrs['barangay_id'] ?? null) === null) {
            abort(422, 'Invalid barangay.');
        }

        $business = $this->registry->registerBusiness(
            $attrs,
            $request->user(),
            $request->file('logo'),
            $request->additionalOwnersPayload(),
            $request->ip()
        );

        return redirect()
            ->route('business-registry.businesses.show', array_merge(
                ['business' => $business->id],
                $this->barangayQueryForRedirect($request, (int) $business->barangay_id)
            ))
            ->with('status', __('Business registered.'));
    }

    public function show(Request $request, Business $business): Response
    {
        $this->authorize('view', $business);

        $business->load([
            'category:id,name,code',
            'barangay:id,name,code',
            'purok:id,name,code',
            'primaryOwnerResident:id,first_name,middle_name,last_name',
            'owners.resident:id,first_name,middle_name,last_name',
            'documents.uploadedBy:id,name',
            'clearances.issuer:id,name',
        ]);

        $activity = AuditLog::query()
            ->where('module', 'business_registry')
            ->where('record_id', $business->id)
            ->orderByDesc('created_at')
            ->limit(80)
            ->get(['id', 'user_id', 'action', 'description', 'created_at', 'ip_address']);

        $tab = in_array($request->query('tab'), ['overview', 'owners', 'documents', 'permits', 'clearances', 'activity'], true)
            ? $request->query('tab')
            : 'overview';

        return Inertia::render('BusinessRegistry/Businesses/Show', [
            'business' => $business,
            'permit_status' => $this->permitDisplayStatus($business),
            'activity' => $activity,
            'active_tab' => $tab,
        ]);
    }

    public function edit(Request $request, Business $business): Response
    {
        $this->authorize('update', $business);

        $categories = BusinessCategory::query()->active()->orderBy('name')->get(['id', 'name', 'code']);
        $puroks = Purok::query()
            ->where('barangay_id', $business->barangay_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $residents = Resident::query()
            ->where('barangay_id', $business->barangay_id)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(400)
            ->get(['id', 'first_name', 'middle_name', 'last_name']);

        $business->loadMissing(['owners.resident', 'barangay:id,name']);

        return Inertia::render('BusinessRegistry/Businesses/Edit', [
            'barangay' => ['id' => $business->barangay_id, 'name' => $business->barangay?->name],
            'business' => $business,
            'categories' => $categories,
            'puroks' => $puroks,
            'residents' => $residents,
        ]);
    }

    public function update(UpdateBusinessRequest $request, Business $business): RedirectResponse
    {
        $validated = $request->safe()->except(['logo', 'additional_owners']);
        $business->fill($validated->all());
        $business->save();

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store("businesses/{$business->id}", 'public');
            if ($business->logo_path) {
                Storage::disk('public')->delete($business->logo_path);
            }
            $business->forceFill(['logo_path' => $path])->save();
        }

        $this->registry->syncAdditionalOwners($business, $request->additionalOwnersPayload());

        return redirect()
            ->route('business-registry.businesses.show', ['business' => $business->id])
            ->with('status', __('Business updated.'));
    }

    public function archive(Request $request, Business $business): RedirectResponse
    {
        $this->authorize('delete', $business);

        $request->validate([
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->registry->archiveBusiness($business, $request->user(), $request->input('remarks'), $request->ip());

        return redirect()
            ->route('business-registry.businesses.show', ['business' => $business->id])
            ->with('status', __('Business closed.'));
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Business::class);

        $user = $request->user();
        $barangayId = $this->restrictedBusinessBarangayId($request);

        $query = Business::query()
            ->with(['category:id,name', 'barangay:id,name', 'purok:id,name']);

        if ($barangayId !== null) {
            $query->where('barangay_id', $barangayId);
        }

        if ($user && ! $user->isSuperAdmin() && $this->isPurokLeader($user)) {
            $query->where('purok_id', $user->purok_id);
        }

        $filename = 'business-registry-export.csv';

        return response()->streamDownload(function () use ($query): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }

            fputcsv($out, [
                'business_code',
                'business_name',
                'owner_name',
                'category',
                'barangay',
                'purok',
                'status',
                'permit_number',
                'permit_expiration_date',
            ]);

            $query->orderBy('business_name')->chunk(500, function ($chunk) use ($out): void {
                foreach ($chunk as $b) {
                    /** @var Business $b */
                    fputcsv($out, [
                        $b->business_code,
                        $b->business_name,
                        $b->owner_name,
                        $b->category?->name,
                        $b->barangay?->name,
                        $b->purok?->name,
                        $b->status,
                        $b->permit_number,
                        $b->permit_expiration_date?->format('Y-m-d'),
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    protected function permitDisplayStatus(Business $business): string
    {
        if ($business->permit_expiration_date === null) {
            return 'none';
        }

        return CarbonImmutable::parse($business->permit_expiration_date)->isPast()
            ? 'expired'
            : 'valid';
    }

    protected function isPurokLeader(User $user): bool
    {
        return User::normalizeRole($user->role ?? '') === 'purok_leader';
    }
}
