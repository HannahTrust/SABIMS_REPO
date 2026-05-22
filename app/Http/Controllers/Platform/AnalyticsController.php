<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Services\Platform\PlatformAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(
        protected PlatformAnalyticsService $analytics
    ) {}

    public function index(Request $request): Response
    {
        $municipalityId = $request->integer('municipality_id') ?: null;
        $days = $request->integer('days', 30) ?: 30;

        return Inertia::render('Platform/Analytics/Index', $this->analytics->build($municipalityId, $days));
    }
}
