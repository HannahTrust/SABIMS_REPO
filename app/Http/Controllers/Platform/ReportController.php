<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Services\Platform\PlatformReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        protected PlatformReportService $reports
    ) {}

    public function index(Request $request): Response
    {
        $module = trim((string) $request->query('module', ''));
        $preview = $this->reports->auditLogPreview($module !== '' ? $module : null);

        return Inertia::render('Platform/Reports/Index', [
            'audit_preview' => $preview['logs'],
            'audit_modules' => $preview['modules'],
            'filters' => [
                'module' => $module,
            ],
        ]);
    }

    public function exportTenants(): StreamedResponse
    {
        return $this->reports->tenantDirectoryCsv();
    }

    public function exportAudit(Request $request): StreamedResponse
    {
        $module = trim((string) $request->query('module', ''));
        $days = $request->integer('days', 30) ?: 30;

        return $this->reports->auditLogCsv(
            $module !== '' ? $module : null,
            $days
        );
    }
}
