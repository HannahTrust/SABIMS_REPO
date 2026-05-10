<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBarangayOfficialRequest;
use App\Http\Requests\UpdateBarangayOfficialRequest;
use App\Models\Barangay;
use App\Models\BarangayOfficial;
use App\Models\BarangayOfficialPosition;
use App\Models\User;
use App\Services\BarangayManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BarangayOfficialController extends Controller
{
    public function __construct(
        protected BarangayManagementService $barangayManagementService
    ) {}

    public function index(Request $request, Barangay $barangay): Response
    {
        $this->authorize('view', $barangay);
        $this->authorize('viewAny', BarangayOfficial::class);

        $this->barangayManagementService->markExpiredOfficialsInactive($barangay->id);

        $positions = BarangayOfficialPosition::query()
            ->orderByDesc('hierarchy_level')
            ->get(['id', 'name', 'code', 'hierarchy_level']);

        $current = BarangayOfficial::query()
            ->where('barangay_id', $barangay->id)
            ->where('is_current', true)
            ->with(['position', 'residentProfile:id,name', 'user:id,name'])
            ->get()
            ->sortByDesc(fn (BarangayOfficial $o) => $o->position?->hierarchy_level ?? 0)
            ->values();

        $past = BarangayOfficial::query()
            ->where('barangay_id', $barangay->id)
            ->where('is_current', false)
            ->with(['position', 'residentProfile:id,name', 'user:id,name'])
            ->orderByDesc('term_end')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        $residentLinks = User::query()
            ->where('barangay_id', $barangay->id)
            ->where('role', 'resident')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $accountLinks = User::query()
            ->where('barangay_id', $barangay->id)
            ->whereIn('role', ['brgy_captain', 'brgy_secretary', 'brgy_admin', 'purok_leader'])
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'email']);

        return Inertia::render('Management/Barangays/Officials', [
            'barangay' => [
                'id' => $barangay->id,
                'name' => $barangay->name,
                'code' => $barangay->code,
            ],
            'positions' => $positions,
            'currentOfficials' => $current->map(fn (BarangayOfficial $o) => $this->serializeOfficial($o))->values()->all(),
            'pastOfficials' => $past->map(fn (BarangayOfficial $o) => $this->serializeOfficial($o))->values()->all(),
            'residentLinks' => $residentLinks->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ])->values()->all(),
            'accountLinks' => $accountLinks->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->role,
                'email' => $u->email,
            ])->values()->all(),
            'can' => [
                'create' => $request->user()?->can('official.create') ?? false,
                'update' => $request->user()?->can('official.update') ?? false,
                'assign' => $request->user()?->can('official.assign') ?? false,
            ],
        ]);
    }

    public function store(StoreBarangayOfficialRequest $request, Barangay $barangay): RedirectResponse
    {
        $this->authorize('create', [BarangayOfficial::class, $barangay]);

        $data = $request->validated();
        unset($data['photo'], $data['signature']);
        $data['is_current'] = $request->boolean('is_current', true);

        $this->barangayManagementService->assignOfficial(
            $barangay,
            $data,
            $request->file('photo'),
            $request->file('signature')
        );

        return redirect()
            ->route('management.barangays.officials.index', $barangay)
            ->with('status', 'Official recorded.');
    }

    public function update(UpdateBarangayOfficialRequest $request, Barangay $barangay, BarangayOfficial $official): RedirectResponse
    {
        $this->authorize('update', $official);

        $data = $request->validated();
        unset($data['photo'], $data['signature']);
        if ($request->has('is_current')) {
            $data['is_current'] = $request->boolean('is_current');
        }

        $this->barangayManagementService->updateOfficial(
            $official,
            $data,
            $request->file('photo'),
            $request->file('signature')
        );

        return redirect()
            ->route('management.barangays.officials.index', $barangay)
            ->with('status', 'Official updated.');
    }

    public function endTerm(Request $request, Barangay $barangay, BarangayOfficial $official): RedirectResponse
    {
        $this->authorize('assign', $official);

        $this->barangayManagementService->endOfficialTerm($official);

        return redirect()
            ->route('management.barangays.officials.index', $barangay)
            ->with('status', 'Term ended for this official.');
    }

    public function setCurrent(Request $request, Barangay $barangay, BarangayOfficial $official): RedirectResponse
    {
        $this->authorize('assign', $official);

        $current = $request->boolean('current', true);

        $this->barangayManagementService->setCurrentOfficial($official, $current);

        return redirect()
            ->route('management.barangays.officials.index', $barangay)
            ->with('status', $current ? 'Marked as current.' : 'Marked as not current.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializeOfficial(BarangayOfficial $o): array
    {
        return [
            'id' => $o->id,
            'full_name' => $o->full_name,
            'contact_number' => $o->contact_number,
            'email' => $o->email,
            'term_start' => $o->term_start?->toDateString(),
            'term_end' => $o->term_end?->toDateString(),
            'is_current' => $o->is_current,
            'official_position_id' => $o->official_position_id,
            'position' => $o->position ? [
                'id' => $o->position->id,
                'name' => $o->position->name,
                'code' => $o->position->code,
            ] : null,
            'resident_id' => $o->resident_id,
            'resident' => $o->residentProfile ? ['id' => $o->residentProfile->id, 'name' => $o->residentProfile->name] : null,
            'user_id' => $o->user_id,
            'linked_user' => $o->user ? ['id' => $o->user->id, 'name' => $o->user->name] : null,
            'photo_url' => $o->photo_path ? Storage::disk('public')->url($o->photo_path) : null,
            'signature_url' => $o->signature_path ? Storage::disk('public')->url($o->signature_path) : null,
        ];
    }
}
