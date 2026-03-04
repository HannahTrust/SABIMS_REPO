<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCouncilSessionRequest;
use App\Http\Requests\UpdateCouncilSessionRequest;
use App\Models\Attendance;
use App\Models\CouncilSession;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouncilSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $sessions = CouncilSession::query()
            ->with('createdBy:id,name')
            ->orderByDesc('session_date')
            ->get();

        $user = $request->user();
        $canCreate = $user && $user->role === 'secretary';

        return Inertia::render('Sessions/Index', [
            'sessions' => $sessions,
            'canCreate' => $canCreate,
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'secretary') {
            abort(403);
        }
        return Inertia::render('Sessions/Create');
    }

    public function store(StoreCouncilSessionRequest $request): RedirectResponse
    {
        $session = CouncilSession::create([
            'session_date' => $request->validated('session_date'),
            'agenda' => $request->validated('agenda'),
            'minutes_file' => $request->validated('minutes_file'),
            'created_by' => $request->user()->id,
        ]);

        $sbMemberIds = User::query()
            ->where('role', 'sb_member')
            ->pluck('id');

        foreach ($sbMemberIds as $userId) {
            Attendance::create([
                'session_id' => $session->id,
                'user_id' => $userId,
                'status' => Attendance::STATUS_ABSENT,
            ]);
        }

        return redirect()->route('sessions.index')->with('status', 'Session created successfully.');
    }

    public function show(Request $request, CouncilSession $session): Response|RedirectResponse
    {
        $session->load(['attendances.user:id,name', 'resolutions:id,title,resolution_number,status,session_id', 'createdBy:id,name']);

        $user = $request->user();
        $canEdit = $user && $user->role === 'secretary';

        return Inertia::render('Sessions/Show', [
            'session' => [
                'id' => $session->id,
                'session_date' => $session->session_date->toDateString(),
                'agenda' => $session->agenda,
                'minutes_file' => $session->minutes_file,
                'created_by' => $session->createdBy ? ['id' => $session->createdBy->id, 'name' => $session->createdBy->name] : null,
                'attendances' => $session->attendances->map(fn ($a) => [
                    'id' => $a->id,
                    'user_id' => $a->user_id,
                    'user' => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
                    'status' => $a->status,
                ])->values()->all(),
                'resolutions' => $session->resolutions->map(fn ($r) => [
                    'id' => $r->id,
                    'title' => $r->title,
                    'resolution_number' => $r->resolution_number,
                    'status' => $r->status,
                ])->values()->all(),
            ],
            'canEdit' => $canEdit,
        ]);
    }

    public function edit(Request $request, CouncilSession $session): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'secretary') {
            abort(403);
        }
        return Inertia::render('Sessions/Edit', [
            'session' => [
                'id' => $session->id,
                'session_date' => $session->session_date->toDateString(),
                'agenda' => $session->agenda,
                'minutes_file' => $session->minutes_file,
            ],
        ]);
    }

    public function update(UpdateCouncilSessionRequest $request, CouncilSession $session): RedirectResponse
    {
        $session->update([
            'session_date' => $request->validated('session_date'),
            'agenda' => $request->validated('agenda'),
            'minutes_file' => $request->validated('minutes_file'),
        ]);
        return redirect()->route('sessions.show', $session)->with('status', 'Session updated successfully.');
    }

    public function destroy(Request $request, CouncilSession $session): RedirectResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'secretary') {
            abort(403);
        }
        $session->delete();
        return redirect()->route('sessions.index')->with('status', 'Session deleted successfully.');
    }
}
