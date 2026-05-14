<?php

namespace App\Http\Controllers\Census;

use App\Http\Controllers\Census\Concerns\ResolvesCensusBarangay;
use App\Http\Controllers\Controller;
use App\Http\Requests\Census\StoreResidentRequest;
use App\Http\Requests\Census\UpdateResidentRequest;
use App\Models\Barangay;
use App\Models\Household;
use App\Models\Purok;
use App\Models\Resident;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResidentController extends Controller
{
    use ResolvesCensusBarangay;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Resident::class);

        $user = $request->user();
        $barangay = $this->censusBarangay($request);

        $query = Resident::query()
            ->with(['purok:id,name', 'household:id,household_code'])
            ->where('barangay_id', $barangay->id);

        if ($user && ! $user->isSuperAdmin() && $this->isPurokLeader($user)) {
            $query->where('purok_id', $user->purok_id);
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $like = "%{$search}%";
                $q->where('first_name', 'like', $like)
                    ->orWhere('middle_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like)
                    ->orWhere('suffix', 'like', $like);
            });
        }

        if ($request->filled('purok_id')) {
            $query->where('purok_id', $request->integer('purok_id'));
        }

        if ($request->filled('gender')) {
            $query->whereRaw('LOWER(TRIM(gender)) = ?', [mb_strtolower(trim((string) $request->query('gender')))]);
        }

        if ($request->query('voter_status') !== null && $request->query('voter_status') !== '') {
            $query->where('voter_status', $request->boolean('voter_status'));
        }

        if ($request->query('senior_citizen') !== null && $request->query('senior_citizen') !== '') {
            $query->where('senior_citizen', $request->boolean('senior_citizen'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $residents = $query
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(20)
            ->withQueryString();

        $puroks = Purok::query()
            ->where('barangay_id', $barangay->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('Census/Residents/Index', [
            'barangay' => ['id' => $barangay->id, 'name' => $barangay->name],
            'residents' => $residents,
            'puroks' => $puroks,
            'filters' => [
                'search' => $search,
                'purok_id' => $request->query('purok_id'),
                'gender' => $request->query('gender'),
                'voter_status' => $request->query('voter_status'),
                'senior_citizen' => $request->query('senior_citizen'),
                'status' => $request->query('status'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Resident::class);

        $barangay = $this->censusBarangay($request);

        $puroks = Purok::query()
            ->where('barangay_id', $barangay->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $households = Household::query()
            ->where('barangay_id', $barangay->id)
            ->orderBy('household_code')
            ->get(['id', 'household_code', 'purok_id']);

        $barangays = [];
        if ($request->user()?->isSuperAdmin()) {
            $barangays = Barangay::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Barangay $b) => ['id' => $b->id, 'name' => $b->name])
                ->values()
                ->all();
        }

        return Inertia::render('Census/Residents/Create', [
            'barangay' => ['id' => $barangay->id, 'name' => $barangay->name],
            'barangays' => $barangays,
            'puroks' => $puroks,
            'households' => $households,
        ]);
    }

    public function store(StoreResidentRequest $request): RedirectResponse
    {
        $this->authorize('create', Resident::class);

        $user = $request->user();
        $data = $request->validated();

        if ($user && ! $user->isSuperAdmin()) {
            $data['barangay_id'] = $user->barangay_id;
        }

        $this->assertPurokInBarangay((int) $data['barangay_id'], (int) $data['purok_id']);
        $this->assertHouseholdInBarangay((int) $data['barangay_id'], $data['household_id'] ?? null);

        $birth = Carbon::parse($data['birth_date']);
        $data['age'] = $birth->age;
        $data['nationality'] = $data['nationality'] ?? 'Filipino';
        $data['voter_status'] = filter_var($data['voter_status'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $data['pwd_status'] = filter_var($data['pwd_status'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $data['senior_citizen'] = filter_var($data['senior_citizen'] ?? false, FILTER_VALIDATE_BOOLEAN)
            || $birth->age >= 60;

        Resident::query()->create($data);

        return redirect()
            ->route('residents.index', $this->barangayQueryForRedirect($request, (int) $data['barangay_id']))
            ->with('status', 'Resident created.');
    }

    public function edit(Request $request, Resident $resident): Response
    {
        $this->authorize('update', $resident);

        $barangay = $this->censusBarangay($request);

        if ((int) $resident->barangay_id !== (int) $barangay->id) {
            abort(404);
        }

        $puroks = Purok::query()
            ->where('barangay_id', $barangay->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $households = Household::query()
            ->where('barangay_id', $barangay->id)
            ->orderBy('household_code')
            ->get(['id', 'household_code', 'purok_id']);

        return Inertia::render('Census/Residents/Edit', [
            'barangay' => ['id' => $barangay->id, 'name' => $barangay->name],
            'resident' => $resident,
            'puroks' => $puroks,
            'households' => $households,
        ]);
    }

    public function update(UpdateResidentRequest $request, Resident $resident): RedirectResponse
    {
        $this->authorize('update', $resident);

        $barangay = $this->censusBarangay($request);

        if ((int) $resident->barangay_id !== (int) $barangay->id) {
            abort(404);
        }

        $data = $request->validated();

        if (isset($data['purok_id'])) {
            $this->assertPurokInBarangay((int) $resident->barangay_id, (int) $data['purok_id']);
        }

        if (array_key_exists('household_id', $data)) {
            $this->assertHouseholdInBarangay((int) $resident->barangay_id, $data['household_id']);
        }

        $birth = isset($data['birth_date'])
            ? Carbon::parse($data['birth_date'])
            : Carbon::parse($resident->birth_date);

        if (isset($data['birth_date'])) {
            $data['age'] = $birth->age;
        }

        foreach (['voter_status', 'senior_citizen', 'pwd_status'] as $boolField) {
            if (array_key_exists($boolField, $data)) {
                $data[$boolField] = filter_var($data[$boolField], FILTER_VALIDATE_BOOLEAN);
            }
        }

        if (array_key_exists('senior_citizen', $data)) {
            $data['senior_citizen'] = $data['senior_citizen'] || $birth->age >= 60;
        }

        $resident->update($data);

        return redirect()
            ->route('residents.index', ['barangay_id' => $request->user()?->isSuperAdmin() ? $barangay->id : null])
            ->with('status', 'Resident updated.');
    }

    public function archive(Request $request, Resident $resident): RedirectResponse
    {
        $this->authorize('update', $resident);

        $barangay = $this->censusBarangay($request);

        if ((int) $resident->barangay_id !== (int) $barangay->id) {
            abort(404);
        }

        $resident->update(['status' => Resident::STATUS_INACTIVE]);

        return redirect()
            ->back()
            ->with('status', 'Resident archived.');
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Resident::class);

        $user = $request->user();
        $barangay = $this->censusBarangay($request);

        $query = Resident::query()
            ->with(['purok:id,name'])
            ->where('barangay_id', $barangay->id);

        if ($user && ! $user->isSuperAdmin() && $this->isPurokLeader($user)) {
            $query->where('purok_id', $user->purok_id);
        }

        $filename = 'residents-barangay-'.$barangay->id.'.csv';

        return response()->streamDownload(function () use ($query): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }

            fputcsv($out, [
                'first_name', 'middle_name', 'last_name', 'suffix', 'birth_date', 'age', 'gender',
                'purok', 'civil_status', 'voter_status', 'senior_citizen', 'pwd_status', 'status', 'contact_number',
            ]);

            $query->orderBy('last_name')->chunk(500, function ($chunk) use ($out): void {
                foreach ($chunk as $r) {
                    /** @var Resident $r */
                    fputcsv($out, [
                        $r->first_name,
                        $r->middle_name,
                        $r->last_name,
                        $r->suffix,
                        $r->birth_date?->format('Y-m-d'),
                        $r->age,
                        $r->gender,
                        $r->purok?->name,
                        $r->civil_status,
                        $r->voter_status ? '1' : '0',
                        $r->senior_citizen ? '1' : '0',
                        $r->pwd_status ? '1' : '0',
                        $r->status,
                        $r->contact_number,
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function printList(Request $request): Response
    {
        $this->authorize('viewAny', Resident::class);

        $user = $request->user();
        $barangay = $this->censusBarangay($request);

        $query = Resident::query()
            ->with(['purok:id,name'])
            ->where('barangay_id', $barangay->id);

        if ($user && ! $user->isSuperAdmin() && $this->isPurokLeader($user)) {
            $query->where('purok_id', $user->purok_id);
        }

        $residents = $query->orderBy('last_name')->orderBy('first_name')->limit(500)->get();

        return Inertia::render('Census/Residents/Print', [
            'barangay' => ['id' => $barangay->id, 'name' => $barangay->name],
            'residents' => $residents,
            'printed_at' => now()->toIso8601String(),
        ]);
    }

    protected function assertPurokInBarangay(int $barangayId, int $purokId): void
    {
        $ok = Purok::query()
            ->where('id', $purokId)
            ->where('barangay_id', $barangayId)
            ->exists();

        if (! $ok) {
            abort(422, 'Purok does not belong to this barangay.');
        }
    }

    protected function assertHouseholdInBarangay(int $barangayId, ?int $householdId): void
    {
        if ($householdId === null) {
            return;
        }

        $ok = Household::query()
            ->where('id', $householdId)
            ->where('barangay_id', $barangayId)
            ->exists();

        if (! $ok) {
            abort(422, 'Household does not belong to this barangay.');
        }
    }

    protected function isPurokLeader(User $user): bool
    {
        return User::normalizeRole($user->role ?? '') === 'purok_leader';
    }

    /**
     * @return array<string, int>
     */
    protected function barangayQueryForRedirect(Request $request, int $barangayId): array
    {
        if ($request->user()?->isSuperAdmin()) {
            return ['barangay_id' => $barangayId];
        }

        return [];
    }
}
