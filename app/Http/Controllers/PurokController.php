<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurokRequest;
use App\Http\Requests\UpdatePurokRequest;
use App\Models\Barangay;
use App\Models\Purok;
use App\Models\User;
use App\Services\BarangayManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurokController extends Controller
{
    public function __construct(
        protected BarangayManagementService $barangayManagementService
    ) {}

    public function index(Request $request, Barangay $barangay): Response
    {
        $this->authorize('view', $barangay);
        $this->authorize('viewAny', Purok::class);

        $puroks = Purok::query()
            ->where('barangay_id', $barangay->id)
            ->with('leader:id,name,role')
            ->withCount(['residents'])
            ->orderBy('name')
            ->get();

        $leaderCandidates = User::query()
            ->where('barangay_id', $barangay->id)
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        return Inertia::render('Management/Barangays/Puroks', [
            'barangay' => [
                'id' => $barangay->id,
                'name' => $barangay->name,
                'code' => $barangay->code,
            ],
            'puroks' => $puroks->map(fn (Purok $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'description' => $p->description,
                'is_active' => $p->is_active,
                'residents_count' => (int) ($p->residents_count ?? 0),
                'leader' => $p->leader ? ['id' => $p->leader->id, 'name' => $p->leader->name, 'role' => $p->leader->role] : null,
                'purok_leader_user_id' => $p->purok_leader_user_id,
            ])->values()->all(),
            'leaderCandidates' => $leaderCandidates->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->role,
            ])->values()->all(),
            'can' => [
                'create' => $request->user()?->can('purok.create') ?? false,
                'update' => $request->user()?->can('purok.update') ?? false,
                'delete' => $request->user()?->can('purok.delete') ?? false,
            ],
        ]);
    }

    public function store(StorePurokRequest $request, Barangay $barangay): RedirectResponse
    {
        $this->authorize('create', [Purok::class, $barangay]);

        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active', true);

        $this->barangayManagementService->createPurok($barangay, $data);

        return redirect()
            ->route('management.barangays.puroks.index', $barangay)
            ->with('status', 'Purok created.');
    }

    public function update(UpdatePurokRequest $request, Barangay $barangay, Purok $purok): RedirectResponse
    {
        $this->authorize('update', $purok);

        $data = $request->validated();
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        $this->barangayManagementService->updatePurok($purok, $data);

        return redirect()
            ->route('management.barangays.puroks.index', $barangay)
            ->with('status', 'Purok updated.');
    }

    public function destroy(Request $request, Barangay $barangay, Purok $purok): RedirectResponse
    {
        $this->authorize('delete', $purok);

        $purok->delete();

        return redirect()
            ->route('management.barangays.puroks.index', $barangay)
            ->with('status', 'Purok deleted.');
    }
}
