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
     * Open attendance for QR scanning. Secretary only.
     */
    public function openAttendance(Request $request, CouncilSession $session): RedirectResponse
    {
        if (! $request->user()?->hasRole('secretary')) {
            abort(403);
        }

        $session->update(['attendance_status' => CouncilSession::ATTENDANCE_OPEN]);

        return redirect()->back()->with('status', 'Attendance is now open. Members can scan the QR code.');
    }

    /**
     * Close attendance for QR scanning. Secretary only.
     */
    public function closeAttendance(Request $request, CouncilSession $session): RedirectResponse
    {
        if (! $request->user()?->hasRole('secretary')) {
            abort(403);
        }

        $session->update(['attendance_status' => CouncilSession::ATTENDANCE_CLOSED]);

        return redirect()->back()->with('status', 'Attendance is now closed.');
    }

    /**
     * Handle QR scan: verify session/token, check open, validate member, record presence.
     */
    public function scan(Request $request, CouncilSession $session, string $token): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        if ($session->qr_token !== $token) {
            return Inertia::render('Attendance/ScanResult', [
                'success' => false,
                'message' => 'Invalid or expired session link.',
            ]);
        }

        if (! $session->isAttendanceOpen()) {
            return Inertia::render('Attendance/ScanResult', [
                'success' => false,
                'message' => 'Attendance is currently closed.',
                'session_title' => $session->session_title,
                'session_date' => $session->session_date->toDateString(),
            ]);
        }

        if (! $user->hasRole('sb_member')) {
            return Inertia::render('Attendance/ScanResult', [
                'success' => false,
                'message' => 'You are not allowed to mark attendance for this session.',
                'session_title' => $session->session_title,
                'session_date' => $session->session_date->toDateString(),
            ])->toResponse($request)->setStatusCode(403);
        }

        $expectedIds = $session->getExpectedMemberIds();
        if (! $expectedIds->contains($user->id)) {
            return Inertia::render('Attendance/ScanResult', [
                'success' => false,
                'message' => 'You are not allowed to mark attendance for this session.',
                'session_title' => $session->session_title,
                'session_date' => $session->session_date->toDateString(),
            ])->toResponse($request)->setStatusCode(403);
        }

        $attendance = Attendance::query()
            ->where('session_id', $session->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $attendance) {
            $attendance = Attendance::create([
                'session_id' => $session->id,
                'user_id' => $user->id,
                'status' => Attendance::STATUS_ABSENT,
            ]);
        }

        if ($attendance->status === Attendance::STATUS_PRESENT) {
            return Inertia::render('Attendance/ScanResult', [
                'success' => true,
                'already_recorded' => true,
                'message' => 'You have already marked your attendance.',
                'session_title' => $session->session_title,
                'session_date' => $session->session_date->toDateString(),
                'time_scanned' => optional($attendance->time_scanned)->toDateTimeString(),
            ]);
        }

        $attendance->update([
            'status' => Attendance::STATUS_PRESENT,
            'time_scanned' => now(),
            'marked_by' => null,
        ]);

        $attendance->refresh();

        return Inertia::render('Attendance/ScanResult', [
            'success' => true,
            'already_recorded' => false,
            'message' => 'Attendance successfully recorded.',
            'session_title' => $session->session_title,
            'session_date' => $session->session_date->toDateString(),
            'time_scanned' => optional($attendance->time_scanned)->toDateTimeString(),
        ]);
    }
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
