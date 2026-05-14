<?php

namespace App\Http\Controllers\BusinessRegistry;

use App\Http\Controllers\BusinessRegistry\Concerns\ResolvesBusinessBarangay;
use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\Business;
use App\Models\User;
use App\Services\BusinessRegistryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ResolvesBusinessBarangay;

    public function __construct(
        protected BusinessRegistryService $registry
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Business::class);

        $user = $request->user();
        $barangay = $this->optionalRegistryBarangay($request);

        $barangayOptions = [];
        if ($user?->isSuperAdmin()) {
            $barangayOptions = Barangay::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (Barangay $b) => [
                    'id' => $b->id,
                    'name' => $b->name,
                    'code' => $b->code,
                ])
                ->values()
                ->all();
        }

        $role = $user ? User::normalizeRole($user->role ?? '') : null;
        if (in_array($role, ['admin', 'vice_mayor'], true)) {
            $barangayOptions = Barangay::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (Barangay $b) => [
                    'id' => $b->id,
                    'name' => $b->name,
                    'code' => $b->code,
                ])
                ->values()
                ->all();
        }

        $metrics = $this->registry->getBusinessAnalytics($barangay);

        $dashboardScope = $barangay === null && ($user?->isSuperAdmin() || in_array($role, ['admin', 'vice_mayor'], true))
            ? 'global'
            : 'barangay';

        return Inertia::render('BusinessRegistry/Dashboard', [
            'barangay_id' => $barangay?->id,
            'barangay_name' => $barangay?->name,
            'barangays' => $barangayOptions,
            'metrics' => $metrics,
            'dashboard_scope' => $dashboardScope,
        ]);
    }
}
