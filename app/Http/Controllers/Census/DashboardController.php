<?php

namespace App\Http\Controllers\Census;

use App\Http\Controllers\Census\Concerns\ResolvesCensusBarangay;
use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\Resident;
use App\Services\PopulationAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ResolvesCensusBarangay;

    public function __construct(
        protected PopulationAnalyticsService $analytics
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Resident::class);

        $user = $request->user();
        $barangay = $this->optionalCensusBarangay($request);

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

        $metrics = null;
        $dashboardScope = 'barangay';

        if ($barangay !== null) {
            $metrics = $this->analytics->dashboardForBarangay($barangay, $user);
        } elseif ($user?->isSuperAdmin()) {
            $metrics = $this->analytics->dashboardForAllBarangays();
            $dashboardScope = 'global';
        }

        return Inertia::render('Census/Dashboard', [
            'barangay_id' => $barangay?->id,
            'barangay_name' => $barangay?->name,
            'barangays' => $barangayOptions,
            'metrics' => $metrics,
            'dashboard_scope' => $dashboardScope,
        ]);
    }
}
