<?php

namespace App\Http\Controllers;

use App\Models\Committee;
use App\Models\User;
use App\Services\Platform\PlatformDashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected PlatformDashboardService $platformDashboard
    ) {}

    /**
     * Display the dashboard with role-based data.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user?->isPlatformAdmin()) {
            return Inertia::render('dashboard/platform', $this->platformDashboard->build());
        }

        $role = $user ? User::normalizeRole($user->role) : null;

        $props = [
            'role' => $role,
            'my_committees' => [],
            'total_committees' => null,
            'total_committees_with_chair' => null,
            'total_members' => null,
        ];

        if ($user && $user->hasRole('sb_member')) {
            $committees = $user->committees()
                ->with('chair:id,name')
                ->orderBy('name')
                ->get(['committees.id', 'committees.name', 'committees.chair_id']);

            $props['my_committees'] = $committees->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'is_chair' => (int) $c->chair_id === (int) $user->id,
            ])->values()->all();
        }

        if ($user && ($user->hasRole('sb_secretary', 'vice_mayor', 'admin') || $user->isSuperAdmin())) {
            $props['total_committees'] = Committee::query()->count();
        }

        if ($user && ($user->hasRole('vice_mayor', 'admin') || $user->isSuperAdmin())) {
            $props['total_committees_with_chair'] = Committee::query()
                ->whereNotNull('chair_id')
                ->count();
            $props['total_members'] = (int) DB::table('committee_user')->count();
        }

        return Inertia::render('dashboard', $props);
    }
}
