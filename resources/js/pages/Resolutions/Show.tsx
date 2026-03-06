import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    FileText,
    ArrowLeft,
    Pencil,
    Calendar,
    Users,
    Hash,
    Lock,
    Globe,
    User,
    Paperclip,
} from 'lucide-react';

type Resolution = {
    id: number;
    resolution_number: string;
    title: string;
    description: string | null;
    status: string;
    visibility: string;
    voting_result: string | null;
    file_path: string | null;
    year: number;
    session: { id: number; session_date: string } | null;
    committee: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
};

type Props = {
    resolution: Resolution;
    canEdit: boolean;
};

const statusConfig: Record<string, string> = {
    draft: 'Draft',
    approved: 'Approved',
    archived: 'Archived',
};

const visibilityConfig: Record<string, { label: string; className: string; Icon: typeof Lock }> = {
    private: {
        label: 'Private',
        className:
            'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        Icon: Lock,
    },
    public: {
        label: 'Public',
        className:
            'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
        Icon: Globe,
    },
};

export default function ResolutionsShow({ resolution, canEdit }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Resolutions', href: '/resolutions' },
        {
            title: resolution.resolution_number,
            href: `/resolutions/${resolution.id}`,
        },
    ];
    const vis = resolution.visibility?.toLowerCase() ?? 'private';
    const visConfig = visibilityConfig[vis] ?? visibilityConfig.private;
    const VisIcon = visConfig.Icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Resolution ${resolution.resolution_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold leading-tight">
                                Resolution {resolution.resolution_number}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {resolution.title}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
                            <Link href="/resolutions">
                                <ArrowLeft className="h-4 w-4" />
                                Back to list
                            </Link>
                        </Button>
                        {canEdit && (
                            <Button size="sm" asChild className="gap-1.5">
                                <Link href={`/resolutions/${resolution.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Details
                        </p>
                    </div>
                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono font-semibold text-primary">
                                {resolution.resolution_number}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase ${visConfig.className}`}
                            >
                                <VisIcon className="h-3 w-3" />
                                {visConfig.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm sm:col-span-2">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="capitalize">
                                {statusConfig[resolution.status.toLowerCase()] ?? resolution.status}
                            </span>
                        </div>
                        {resolution.session && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Session: {resolution.session.session_date}</span>
                            </div>
                        )}
                        {resolution.committee && (
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{resolution.committee.name}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Year:</span>
                            <span>{resolution.year}</span>
                        </div>
                        {resolution.voting_result && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Voting result:</span>
                                <span>{resolution.voting_result}</span>
                            </div>
                        )}
                        {resolution.created_by && (
                            <div className="flex items-center gap-2 text-sm sm:col-span-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Created by {resolution.created_by.name}</span>
                            </div>
                        )}
                        {resolution.file_path && (
                            <div className="flex items-center gap-2 text-sm sm:col-span-2">
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{resolution.file_path}</span>
                            </div>
                        )}
                    </div>
                    {resolution.description && (
                        <>
                            <div className="border-t border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Description
                                </p>
                            </div>
                            <div className="px-5 pb-5">
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {resolution.description}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
