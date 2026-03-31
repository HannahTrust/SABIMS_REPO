export const ORDINANCE_STATUSES = ['draft', 'reviewed', 'approved', 'archived'] as const;

export type OrdinanceStatus = (typeof ORDINANCE_STATUSES)[number];

export const ORDINANCE_STATUS_CONFIG: Record<
    OrdinanceStatus,
    { label: string; className: string }
> = {
    draft: {
        label: 'Draft',
        className:
            'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    },
    reviewed: {
        label: 'Reviewed',
        className:
            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    },
    approved: {
        label: 'Approved',
        className:
            'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    },
    archived: {
        label: 'Archived',
        className:
            'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    },
};

export function isOrdinanceStatus(value: string): value is OrdinanceStatus {
    return (ORDINANCE_STATUSES as readonly string[]).includes(value);
}

