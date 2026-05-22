export const INCIDENT_REPORT_STATUSES = [
    'pending',
    'under_mediation',
    'scheduled',
    'resolved',
    'elevated',
    'archived',
] as const;

export type IncidentReportStatus = (typeof INCIDENT_REPORT_STATUSES)[number];

export const INCIDENT_REPORT_STATUS_CONFIG: Record<
    IncidentReportStatus,
    { label: string; className: string }
> = {
    pending: {
        label: 'Pending',
        className:
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    },
    under_mediation: {
        label: 'Under Mediation',
        className:
            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    },
    scheduled: {
        label: 'Scheduled',
        className:
            'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
    },
    resolved: {
        label: 'Resolved',
        className:
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    },
    elevated: {
        label: 'Elevated',
        className:
            'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    },
    archived: {
        label: 'Archived',
        className:
            'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-700',
    },
};

export function isIncidentReportStatus(value: string): value is IncidentReportStatus {
    return (INCIDENT_REPORT_STATUSES as readonly string[]).includes(value);
}
