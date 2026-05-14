<?php

namespace App\Http\Controllers\Census;

use App\Http\Controllers\Census\Concerns\ResolvesCensusBarangay;
use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\Purok;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class HouseholdController extends Controller
{
    use ResolvesCensusBarangay;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Household::class);

        $user = $request->user();
        $barangay = $this->censusBarangay($request);

        $query = Household::query()
            ->with(['purok:id,name', 'head:id,first_name,last_name'])
            ->withCount('members')
            ->where('barangay_id', $barangay->id);

        if ($user && ! $user->isSuperAdmin() && User::normalizeRole($user->role ?? '') === 'purok_leader') {
            $query->where('purok_id', $user->purok_id);
        }

        $households = $query
            ->orderBy('household_code')
            ->paginate(20)
            ->withQueryString();

        $puroks = Purok::query()
            ->where('barangay_id', $barangay->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Census/Households/Index', [
            'barangay' => ['id' => $barangay->id, 'name' => $barangay->name],
            'households' => $households,
            'puroks' => $puroks,
        ]);
    }

    public function show(Request $request, Household $household): Response
    {
        $this->authorize('view', $household);

        $household->load([
            'purok:id,name',
            'head:id,first_name,middle_name,last_name,suffix',
            'members' => fn ($q) => $q->orderBy('last_name')->orderBy('first_name'),
        ]);

        return Inertia::render('Census/Households/Show', [
            'household' => $household,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Household::class);

        $user = $request->user();
        $barangay = $this->censusBarangay($request);

        $validated = $request->validate([
            'purok_id' => ['required', 'integer', Rule::exists('puroks', 'id')->where('barangay_id', $barangay->id)],
            'household_code' => ['required', 'string', 'max:255', Rule::unique('households', 'household_code')->where('barangay_id', $barangay->id)],
            'address' => ['nullable', 'string', 'max:65535'],
            'monthly_income' => ['nullable', 'numeric'],
            'housing_type' => ['nullable', 'string', 'max:64'],
        ]);

        Household::query()->create([
            'barangay_id' => $barangay->id,
            'purok_id' => $validated['purok_id'],
            'household_code' => $validated['household_code'],
            'address' => $validated['address'] ?? null,
            'monthly_income' => $validated['monthly_income'] ?? null,
            'housing_type' => $validated['housing_type'] ?? null,
            'is_active' => true,
        ]);

        $params = $user?->isSuperAdmin() ? ['barangay_id' => $barangay->id] : [];

        return redirect()
            ->route('residents.households.index', $params)
            ->with('status', 'Household created.');
    }

    public function update(Request $request, Household $household): RedirectResponse
    {
        $this->authorize('update', $household);

        $barangay = $this->censusBarangay($request);

        if ((int) $household->barangay_id !== (int) $barangay->id) {
            abort(404);
        }

        $validated = $request->validate([
            'purok_id' => ['sometimes', 'integer', Rule::exists('puroks', 'id')->where('barangay_id', $barangay->id)],
            'household_code' => ['sometimes', 'string', 'max:255', Rule::unique('households', 'household_code')->where('barangay_id', $barangay->id)->ignore($household->id)],
            'address' => ['nullable', 'string', 'max:65535'],
            'monthly_income' => ['nullable', 'numeric'],
            'housing_type' => ['nullable', 'string', 'max:64'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $household->update($validated);

        return redirect()
            ->back()
            ->with('status', 'Household updated.');
    }

    public function setHead(Request $request, Household $household): RedirectResponse
    {
        $this->authorize('setHead', $household);

        $barangay = $this->censusBarangay($request);

        if ((int) $household->barangay_id !== (int) $barangay->id) {
            abort(404);
        }

        $validated = $request->validate([
            'resident_id' => ['nullable', 'integer', 'exists:residents,id'],
        ]);

        $residentId = $validated['resident_id'] ?? null;

        if ($residentId !== null) {
            $resident = Resident::query()->findOrFail($residentId);
            if ((int) $resident->household_id !== (int) $household->id) {
                abort(422, 'Resident must belong to this household.');
            }
            if ((int) $resident->barangay_id !== (int) $household->barangay_id) {
                abort(422);
            }
        }

        $household->update(['household_head_resident_id' => $residentId]);

        return redirect()
            ->back()
            ->with('status', 'Household head updated.');
    }
}
