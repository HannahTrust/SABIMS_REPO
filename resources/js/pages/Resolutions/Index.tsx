import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Pencil, Calendar, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Resolutions', href: '/resolutions' },
];

type Resolution = {
    id: number;
    resolution_number: string;
    title: string;
    description: string | null;
    status: string;
    visibility: string;
    year: number;
    session: { id: number; session_date: string } | null;
    committee: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
};

type Props = {
    resolutions: Resolution[];
    canCreate: boolean;
};

const statusConfig: Record<string, { label: string; className: string }> = {
    draft: {
        label: 'Draft',
        className:
            'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    },
    pending: {
        label: 'Pending',
        className:
            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    },
    approved: {
        label: 'Approved',
        className:
            'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    },
    rejected: {
        label: 'Rejected',
        className:
            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    },
    archived: {
        label: 'Archived',
        className:
            'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    },
};

function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status.toLowerCase()] ?? {
        label: status,
        className:
            'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
    };
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${config.className}`}
        >
            {config.label}
        </span>
    );
}

const visibilityConfig: Record<string, { label: string; className: string }> = {
    private: {
        label: 'Private',
        className:
            'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    },
    public: {
        label: 'Public',
        className:
            'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    },
};

function VisibilityBadge({ visibility: vis }: { visibility: string }) {
    const config = visibilityConfig[vis?.toLowerCase() ?? 'private'] ?? visibilityConfig.private;
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase ${config.className}`}
        >
            {config.label}
        </span>
    );
}

export default function ResolutionsIndex({ resolutions, canCreate }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resolutions" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Flash message */}
                {flash?.status && (
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                        <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-green-500" />
                        {flash.status}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold leading-tight">
                                Resolutions
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {resolutions.length}{' '}
                                {resolutions.length === 1
                                    ? 'resolution'
                                    : 'resolutions'}{' '}
                                on record
                            </p>
                        </div>
                    </div>
                    {canCreate && (
                        <Button asChild size="sm" className="gap-2 self-start sm:self-auto">
                            <Link href="/resolutions/create">
                                <Plus className="h-4 w-4" />
                                New Resolution
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Content */}
                {resolutions.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-sidebar-border/70 py-16 text-center dark:border-sidebar-border">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">No resolutions yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Resolutions filed will appear here.
                            </p>
                        </div>
                        {canCreate && (
                            <Button asChild size="sm" variant="outline" className="mt-2 gap-2">
                                <Link href="/resolutions/create">
                                    <Plus className="h-4 w-4" />
                                    File a Resolution
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border sm:block">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 bg-muted/40 dark:border-sidebar-border">
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Resolution No.
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Title
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Committee
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Year
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Visibility
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Status
                                        </th>
                                        {canCreate && (
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Action
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                    {resolutions.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/resolutions/${r.id}`}
                                                    className="font-mono text-sm font-semibold text-primary hover:underline"
                                                >
                                                    {r.resolution_number}
                                                </Link>
                                            </td>
                                            <td className="max-w-xs px-4 py-3">
                                                <span className="line-clamp-2 font-medium leading-snug">
                                                    {r.title}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.committee?.name ? (
                                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                                        {r.committee.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/50">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                                    {r.year}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <VisibilityBadge visibility={r.visibility ?? 'private'} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={r.status} />
                                            </td>
                                            {canCreate && (
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/resolutions/${r.id}/edit`}
                                                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border transition-colors hover:bg-muted hover:text-foreground"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                        Edit
                                                    </Link>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="flex flex-col gap-3 sm:hidden">
                            {resolutions.map((r) => (
                                <div
                                    key={r.id}
                                    className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border"
                                >
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <Link
                                            href={`/resolutions/${r.id}`}
                                            className="font-mono text-sm font-bold text-primary hover:underline"
                                        >
                                            {r.resolution_number}
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <VisibilityBadge visibility={r.visibility ?? 'private'} />
                                            <StatusBadge status={r.status} />
                                        </div>
                                    </div>
                                    <p className="mb-3 text-sm font-medium leading-snug">
                                        {r.title}
                                    </p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        {r.committee?.name && (
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {r.committee.name}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {r.year}
                                        </span>
                                    </div>
                                    {canCreate && (
                                        <div className="mt-3 border-t border-sidebar-border/70 pt-3 dark:border-sidebar-border">
                                            <Link
                                                href={`/resolutions/${r.id}/edit`}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Edit Resolution
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}