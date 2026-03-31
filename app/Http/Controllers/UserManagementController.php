<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $authUser = $request->user();

        if (! $authUser || ! $authUser->hasRole('super_admin')) {
            abort(403);
        }

        $users = User::query()
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'created_at']);

        return Inertia::render('Users/Index', [
            'users' => $users->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => User::normalizeRole($u->role),
                'is_active' => (bool) $u->is_active,
                'created_at' => $u->created_at?->toDateTimeString(),
            ])->values()->all(),
            'allowedRoles' => User::allowedRoles(),
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $authUser = $request->user();
        if (! $authUser || ! $authUser->hasRole('super_admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in(User::allowedRoles())],
        ]);

        $newRole = User::normalizeRole($validated['role']);
        if ($newRole === null) {
            throw ValidationException::withMessages(['role' => 'Invalid role.']);
        }

        // Cannot downgrade yourself from super_admin.
        if ($authUser->id === $user->id && $newRole !== 'super_admin') {
            throw ValidationException::withMessages([
                'role' => 'You cannot remove your own super_admin role.',
            ]);
        }

        // Prevent multiple super_admin.
        if ($newRole === 'super_admin') {
            $anotherExists = User::query()
                ->where('role', 'super_admin')
                ->where('id', '!=', $user->id)
                ->exists();

            if ($anotherExists) {
                throw ValidationException::withMessages([
                    'role' => 'Only one super_admin is allowed.',
                ]);
            }
        }

        $oldRole = User::normalizeRole($user->role);

        $user->update(['role' => $newRole]);

        logActivity(
            'update',
            'user_role',
            $user->id,
            "Changed user role: {$user->email} ({$user->name}) from {$oldRole} to {$newRole}",
        );

        return redirect()->route('users.index')->with('status', 'User role updated successfully.');
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $authUser = $request->user();
        if (! $authUser || ! $authUser->hasRole('super_admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $newStatus = (bool) $validated['is_active'];

        // Prevent locking out super_admin.
        $targetRole = User::normalizeRole($user->role);
        if ($targetRole === 'super_admin' && $newStatus === false) {
            throw ValidationException::withMessages([
                'is_active' => 'Super admin cannot be deactivated.',
            ]);
        }

        // Prevent self-deactivation.
        if ($authUser->id === $user->id && $newStatus === false) {
            throw ValidationException::withMessages([
                'is_active' => 'You cannot deactivate your own account.',
            ]);
        }

        $user->update(['is_active' => $newStatus]);

        logActivity(
            'update',
            'user_status',
            $user->id,
            ($newStatus ? 'Activated' : 'Deactivated')." user: {$user->email} ({$user->name})",
        );

        return redirect()->route('users.index')->with('status', 'User status updated successfully.');
    }
}

