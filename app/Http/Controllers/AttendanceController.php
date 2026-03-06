<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateAttendanceRequest;
use App\Models\Attendance;
use App\Models\CouncilSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * List attendance for a session. Viewable by vice_mayor, sb_member, admin.
     */
    public function index(Request $request, CouncilSession $session): Response|RedirectResponse
    {
        $user = $request->user();
        $normalized = $user ? \App\Models\User::normalizeRole($user->role) : null;
        $canView = $normalized && in_array($normalized, ['vice_mayor', 'sb_member', 'admin', 'secretary'], true);
        if (! $canView) {
            abort(403);
        }

        $session->load(['attendances.user:id,name']);

        $canUpdate = $user && $user->hasRole('secretary');

        return Inertia::render('Sessions/Attendance', [
            'session' => [
                'id' => $session->id,
                'session_date' => $session->session_date->toDateString(),
            ],
            'attendances' => $session->attendances->map(fn (Attendance $a) => [
                'id' => $a->id,
                'user_id' => $a->user_id,
                'user' => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
                'status' => $a->status,
                'reason' => $a->reason,
                'remarks' => $a->remarks,
            ])->values()->all(),
            'canUpdate' => $canUpdate,
        ]);
    }

    /**
     * Update attendance status/remarks. Secretary only.
     */
    public function update(UpdateAttendanceRequest $request, Attendance $attendance): RedirectResponse
    {
        $attendance->update([
            'status' => $request->validated('status'),
            'reason' => $request->validated('reason'),
        ]);

        return redirect()->back()->with('status', 'Attendance updated.');
    }
}
