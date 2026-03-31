<?php

use App\Models\AuditLog;

if (! function_exists('logActivity')) {
    /**
     * Centralized audit logging helper.
     */
    function logActivity(string $action, string $module, int|string|null $recordId, string $description): void
    {
        try {
            $userId = auth()->id();
            $ip = request()?->ip();

            AuditLog::create([
                'user_id' => $userId,
                'action' => $action,
                'module' => $module,
                'record_id' => $recordId === null ? null : (int) $recordId,
                'description' => $description,
                'ip_address' => $ip,
                'created_at' => now(),
            ]);
        } catch (Throwable $e) {
            // Never break the main flow because audit logging failed.
        }
    }
}
