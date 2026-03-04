<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommitteeRequest;
use App\Http\Requests\UpdateCommitteeMembersRequest;
use App\Http\Requests\UpdateCommitteeRequest;
use App\Models\Committee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommitteeController extends Controller
{
    /**
     * Display a listing of committees.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $canCreate = $user && $user->hasRole('admin', 'secretary');
        $canManageMembers = $user && $user->hasRole('admin', 'secretary', 'vice_mayor');

        return Inertia::render('Committees/Index', [
            'committees' => Committee::query()
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'chair_id', 'created_by', 'created_at']),
            'canCreate' => $canCreate,
            'canManageMembers' => $canManageMembers,
        ]);
    }

    /**
     * Display the specified committee.
     * All authenticated users can view.
     */
    public function show(Request $request, Committee $committee): Response
    {
        $committee->load(['members:id,name', 'chair:id,name']);

        $user = $request->user();
        $canManageMembers = $user && $user->hasRole('admin', 'secretary', 'vice_mayor');

        return Inertia::render('Committees/Show', [
            'committee' => [
                'id' => $committee->id,
                'name' => $committee->name,
                'description' => $committee->description,
                'chair_id' => $committee->chair_id,
                'chair' => $committee->chair
                    ? ['id' => $committee->chair->id, 'name' => $committee->chair->name]
                    : null,
                'members' => $committee->members->map(fn ($m) => [
                    'id' => $m->id,
                    'name' => $m->name,
                ])->values()->all(),
            ],
            'canManageMembers' => $canManageMembers,
        ]);
    }

    /**
     * Show the form for creating a committee.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! $user->hasRole('admin', 'secretary')) {
            abort(403);
        }
        return Inertia::render('Committees/Create');
    }

    /**
     * Store a newly created committee.
     * Only admin or secretary can create.
     */
    public function store(StoreCommitteeRequest $request): RedirectResponse
    {
        Committee::create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'created_by' => $request->user()?->id,
        ]);

        return redirect()->route('committees.index')
            ->with('status', 'Committee created successfully.');
    }

    /**
     * Show the form for editing a committee.
     */
    public function edit(Request $request, Committee $committee): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! $user->hasRole('admin', 'secretary')) {
            abort(403);
        }
        return Inertia::render('Committees/Edit', [
            'committee' => [
                'id' => $committee->id,
                'name' => $committee->name,
                'description' => $committee->description,
            ],
        ]);
    }

    /**
     * Update the specified committee.
     */
    public function update(UpdateCommitteeRequest $request, Committee $committee): RedirectResponse
    {
        $committee->update([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
        ]);
        return redirect()->route('committees.index')
            ->with('status', 'Committee updated successfully.');
    }

    /**
     * Remove the specified committee.
     */
    public function destroy(Request $request, Committee $committee): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! $user->hasRole('admin', 'secretary')) {
            abort(403);
        }
        $committee->delete();
        return redirect()->route('committees.index')
            ->with('status', 'Committee deleted successfully.');
    }

    /**
     * Show the manage members page for a committee.
     * Only admin, secretary, or vice_mayor can access.
     */
    public function manageMembers(Request $request, Committee $committee): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! $user->hasRole('admin', 'secretary', 'vice_mayor')) {
            abort(403);
        }

        $committee->load('members:id,name');

        return Inertia::render('Committees/ManageMembers', [
            'committee' => [
                'id' => $committee->id,
                'name' => $committee->name,
                'chair_id' => $committee->chair_id,
                'member_ids' => $committee->members->pluck('id')->values()->all(),
            ],
            'sbMembers' => User::query()
                ->where('role', 'sb_member')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Update committee members and chair.
     * Only admin or secretary can update.
     */
    public function updateMembers(UpdateCommitteeMembersRequest $request, Committee $committee): RedirectResponse
    {
        $members = $request->validated('members');
        $chairId = (int) $request->validated('chair_id');

        $committee->members()->sync($members);
        $committee->update(['chair_id' => $chairId]);

        return redirect()
            ->route('committees.manage-members', $committee)
            ->with('status', 'Members and chair updated successfully.');
    }
}
