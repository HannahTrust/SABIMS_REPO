<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCouncilSessionRequest;
use App\Http\Requests\UpdateCouncilSessionRequest;
use App\Models\Attendance;
use App\Models\Committee;
use App\Models\CouncilSession;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CouncilSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $normalizedRole = $user ? User::normalizeRole($user->role) : null;

        $query = CouncilSession::query()
            ->with(['createdBy:id,name', 'committee:id,name'])
            ->orderByDesc('session_date');

        // SB members should only see sessions where they are actually included/expected.
        // We consider a session as "kasali siya" if:
        // - may attendance record siya sa session, OR
        // - yung session ay para sa committee kung saan member/chair siya, OR
        // - general session for all SB members (walang committee_id).
        if ($normalizedRole === 'sb_member') {
            $userCommitteeIds = $user->committees()->pluck('committees.id');

            $query->where(function ($q) use ($user, $userCommitteeIds) {
                $q->whereHas('attendances', function ($qa) use ($user) {
                    $qa->where('user_id', $user->id);
                })->orWhere(function ($qb) use ($userCommitteeIds) {
                    $qb->whereNull('committee_id')
                        ->orWhereIn('committee_id', $userCommitteeIds);
                });
            });
        }
        // Secretary, admin, etc. see all sessions (no extra filter)

        $sessions = $query->get();
        $canCreate = $user && $normalizedRole === 'secretary';

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
        $committees = Committee::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Sessions/Create', [
            'committees' => $committees,
        ]);
    }

    public function store(StoreCouncilSessionRequest $request): RedirectResponse
    {
        $minutesType = $request->input('minutes_type', 'upload');
        $minutesFile = null;
        $minutesContent = null;

        if ($minutesType === 'text') {
            $minutesContent = $request->input('minutes_content');
        } elseif ($minutesType === 'upload' && $request->hasFile('minutes_file')) {
            $minutesFile = $request->file('minutes_file')->store('minutes', 'public');
        }

        $session = CouncilSession::create([
            'session_title' => $request->validated('session_title'),
            'session_date' => $request->validated('session_date'),
            'committee_id' => $request->validated('committee_id'),
            'attendance_status' => CouncilSession::ATTENDANCE_CLOSED,
            'qr_token' => \Illuminate\Support\Str::random(64),
            'agenda' => $request->validated('agenda'),
            'minutes_type' => $minutesType,
            'minutes_file' => $minutesFile,
            'minutes_content' => $minutesContent,
            'created_by' => $request->user()->id,
        ]);

        $session->notifyExpectedMembers();

        return redirect()->route('sessions.index')->with('status', 'Session created successfully.');
    }

    public function show(Request $request, CouncilSession $session): Response|RedirectResponse
    {
        $session->load(['attendances.user:id,name', 'committee:id,name', 'resolutions:id,title,resolution_number,status,session_id', 'createdBy:id,name']);

        $user = $request->user();
        $normalizedRole = $user ? User::normalizeRole($user->role) : null;
        $canEdit = $user && $normalizedRole === 'secretary';

        // SB members may only view sessions they are assigned to
        if ($normalizedRole === 'sb_member') {
            $expectedIds = $session->getExpectedMemberIds();
            if (! $expectedIds->contains($user->id)) {
                abort(403, 'You are not assigned to this session.');
            }
        }

        $isAssignedToSession = $canEdit || ($user && $session->getExpectedMemberIds()->contains($user->id));
        $isAttendanceOpen = ($session->attendance_status ?? 'closed') === CouncilSession::ATTENDANCE_OPEN;
        $showQrCode = $isAssignedToSession && $isAttendanceOpen && $session->getScanUrl();

        $minutesFileUrl = $session->minutes_type === 'upload' && $session->minutes_file
            ? Storage::url($session->minutes_file)
            : null;

        $totalExpected = $session->attendances->count();
        $presentCount = $session->attendances->where('status', Attendance::STATUS_PRESENT)->count();
        $absentCount = $session->attendances->where('status', Attendance::STATUS_ABSENT)->count();

        return Inertia::render('Sessions/Show', [
            'session' => [
                'id' => $session->id,
                'session_title' => $session->session_title,
                'session_date' => $session->session_date->toDateString(),
                'committee' => $session->committee ? ['id' => $session->committee->id, 'name' => $session->committee->name] : null,
                'attendance_status' => $session->attendance_status ?? 'closed',
                'scan_url' => $session->getScanUrl(),
                'agenda' => $session->agenda,
                'minutes_type' => $session->minutes_type ?? 'upload',
                'minutes_file' => $session->minutes_file,
                'minutes_file_url' => $minutesFileUrl,
                'minutes_content' => $session->minutes_content,
                'created_by' => $session->createdBy ? ['id' => $session->createdBy->id, 'name' => $session->createdBy->name] : null,
                'attendances' => $session->attendances->map(fn ($a) => [
                    'id' => $a->id,
                    'user_id' => $a->user_id,
                    'user' => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
                    'status' => $a->status,
                    'reason' => $a->reason,
                    'time_scanned' => $a->time_scanned?->toIso8601String(),
                ])->values()->all(),
                'total_expected' => $totalExpected,
                'present_count' => $presentCount,
                'absent_count' => $absentCount,
                'resolutions' => $session->resolutions->map(fn ($r) => [
                    'id' => $r->id,
                    'title' => $r->title,
                    'resolution_number' => $r->resolution_number,
                    'status' => $r->status,
                ])->values()->all(),
            ],
            'canEdit' => $canEdit,
            'showQrCode' => $showQrCode,
            'isAssignedToSession' => $isAssignedToSession,
        ]);
    }

    public function edit(Request $request, CouncilSession $session): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'secretary') {
            abort(403);
        }
        $committees = Committee::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Sessions/Edit', [
            'session' => [
                'id' => $session->id,
                'session_title' => $session->session_title,
                'session_date' => $session->session_date->toDateString(),
                'committee_id' => $session->committee_id,
                'agenda' => $session->agenda,
                'minutes_file' => $session->minutes_file,
            ],
            'committees' => $committees,
        ]);
    }

    public function update(UpdateCouncilSessionRequest $request, CouncilSession $session): RedirectResponse
    {
        $session->update([
            'session_title' => $request->validated('session_title'),
            'session_date' => $request->validated('session_date'),
            'committee_id' => $request->validated('committee_id'),
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
