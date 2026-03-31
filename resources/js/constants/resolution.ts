export const RESOLUTION_STATUSES = ['draft', 'approved', 'archived'] as const;

export type ResolutionStatus = (typeof RESOLUTION_STATUSES)[number];

export const RESOLUTION_STATUS_CONFIG: Record<
    ResolutionStatus,
    { label: string; className: string }
> = {
    draft: {
        label: 'Draft',
        className:
            'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
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

export function isResolutionStatus(value: string): value is ResolutionStatus {
    return (RESOLUTION_STATUSES as readonly string[]).includes(value);
}

