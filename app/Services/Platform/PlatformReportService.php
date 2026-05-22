<?php

namespace App\Services\Platform;

use App\Models\AuditLog;
use App\Models\Municipality;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PlatformReportService
{
    public function tenantDirectoryCsv(): StreamedResponse
    {
        $filename = 'tenant-directory-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }

            fputcsv($out, [
                'id', 'code', 'name', 'system_name', 'module_name', 'is_active',
                'barangays_count', 'users_count', 'created_at',
            ]);

            Municipality::query()
                ->withCount(['barangays', 'users'])
                ->orderBy('name')
                ->chunk(100, function ($chunk) use ($out): void {
                    foreach ($chunk as $m) {
                        /** @var Municipality $m */
                        fputcsv($out, [
                            $m->id,
                            $m->code,
                            $m->name,
                            $m->system_name,
                            $m->module_name,
                            $m->is_active ? '1' : '0',
                            $m->barangays_count,
                            $m->users_count,
                            $m->created_at?->toDateTimeString(),
                        ]);
                    }
                });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function auditLogCsv(?string $module = null, ?int $days = 30): StreamedResponse
    {
        $days = max(1, min(365, $days ?? 30));
        $since = Carbon::now()->subDays($days)->startOfDay();
        $filename = 'platform-audit-log-'.now()->format('Y-m-d').'.csv';

        $query = AuditLog::query()
            ->with('user:id,name,email')
            ->where('created_at', '>=', $since)
            ->orderByDesc('created_at');

        if ($module !== null && $module !== '') {
            $query->where('module', $module);
        }

        return response()->streamDownload(function () use ($query): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }

            fputcsv($out, [
                'id', 'created_at', 'user_name', 'user_email', 'action', 'module', 'record_id', 'description', 'ip_address',
            ]);

            $query->chunk(500, function ($chunk) use ($out): void {
                foreach ($chunk as $log) {
                    /** @var AuditLog $log */
                    fputcsv($out, [
                        $log->id,
                        $log->created_at,
                        $log->user?->name,
                        $log->user?->email,
                        $log->action,
                        $log->module,
                        $log->record_id,
                        $log->description,
                        $log->ip_address,
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * @return array{logs: list<array<string, mixed>>, modules: list<string>}
     */
    public function auditLogPreview(?string $module = null, int $limit = 25): array
    {
        $query = AuditLog::query()
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->limit($limit);

        if ($module !== null && $module !== '') {
            $query->where('module', $module);
        }

        $logs = $query->get()->map(fn (AuditLog $log) => [
            'id' => $log->id,
            'action' => $log->action,
            'module' => $log->module,
            'description' => $log->description,
            'user_name' => $log->user?->name ?? 'System',
            'created_at' => $log->created_at?->toDateTimeString(),
        ])->values()->all();

        $modules = AuditLog::query()
            ->select('module')
            ->distinct()
            ->orderBy('module')
            ->pluck('module')
            ->values()
            ->all();

        return [
            'logs' => $logs,
            'modules' => $modules,
        ];
    }
}
