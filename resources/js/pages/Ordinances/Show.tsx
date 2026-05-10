import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Hash,
    Paperclip,
    Pencil,
    ShieldCheck,
    Archive,
    Users,
    User,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { ORDINANCE_STATUS_CONFIG, isOrdinanceStatus } from '@/constants/ordinance';
import type { BreadcrumbItem } from '@/types';

type Ordinance = {
    id: number;
    title: string;
    ordinance_number: string | null;
    description: string | null;
    committee: { id: number; name: string } | null;
    session: { id: number; session_date: string } | null;
    status: string;
    file_path: string | null;
    file_url: string | null;
    created_by: { id: number; name: string } | null;
    approved_by: { id: number; name: string } | null;
    approved_at: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type Props = {
    ordinance: Ordinance;
    canEdit: boolean;
    canApprove: boolean;
    canArchive: boolean;
};

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();
    const config = isOrdinanceStatus(normalized)
        ? ORDINANCE_STATUS_CONFIG[normalized]
        : {
              label: status,
              className:
                  'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
          };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${config.className}`}
        >
            {config.label}
        </span>
    );
}

function isPdf(pathOrUrl: string) {
    return pathOrUrl.toLowerCase().endsWith('.pdf');
}

export default function OrdinancesShow({ ordinance, canEdit, canApprove, canArchive }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Ordinances', href: '/ordinances' },
        { title: ordinance.ordinance_number ?? `#${ordinance.id}`, href: `/ordinances/${ordinance.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={ordinance.ordinance_number ? `Ordinance ${ordinance.ordinance_number}` : `Ordinance #${ordinance.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {flash?.status && (
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                        <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-green-500" />
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold leading-tight">
                                {ordinance.ordinance_number ? `Ordinance ${ordinance.ordinance_number}` : `Ordinance #${ordinance.id}`}
                            </h1>
                            <p className="text-xs text-muted-foreground">{ordinance.title}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
                            <Link href="/ordinances">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        {canEdit && (
                            <Button size="sm" asChild className="gap-1.5">
                                <Link href={`/ordinances/${ordinance.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {canApprove && (
                            <Form action={`/ordinances/${ordinance.id}/approve`} method="post" className="inline">
                                <Button type="submit" size="sm" variant="outline" className="gap-1.5">
                                    <ShieldCheck className="h-4 w-4" />
                                    Approve
                                </Button>
                            </Form>
                        )}
                        {canArchive && (
                            <Form action={`/ordinances/${ordinance.id}/archive`} method="post" className="inline">
                                <Button type="submit" size="sm" variant="outline" className="gap-1.5">
                                    <Archive className="h-4 w-4" />
                                    Archive
                                </Button>
                            </Form>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overview</p>
                    </div>
                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono font-semibold text-primary">
                                {ordinance.ordinance_number ?? '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <StatusBadge status={ordinance.status} />
                        </div>
                        {ordinance.committee && (
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{ordinance.committee.name}</span>
                            </div>
                        )}
                        {ordinance.session && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Session: {ordinance.session.session_date}</span>
                            </div>
                        )}
                        {ordinance.created_by && (
                            <div className="flex items-center gap-2 text-sm sm:col-span-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Created by {ordinance.created_by.name}</span>
                            </div>
                        )}
                        {ordinance.approved_by && ordinance.approved_at && (
                            <div className="flex items-center gap-2 text-sm sm:col-span-2">
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    Approved by {ordinance.approved_by.name} on {ordinance.approved_at}
                                </span>
                            </div>
                        )}
                        {(ordinance.created_at || ordinance.updated_at) && (
                            <div className="flex items-center gap-2 text-sm sm:col-span-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {ordinance.created_at ? `Created ${ordinance.created_at}` : ''}
                                    {ordinance.updated_at ? ` • Updated ${ordinance.updated_at}` : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    {ordinance.description && (
                        <>
                            <div className="border-t border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Description
                                </p>
                            </div>
                            <div className="px-5 pb-5">
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {ordinance.description}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Document</p>
                    </div>
                    <div className="p-5">
                        {ordinance.file_url ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                    <a
                                        href={ordinance.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        View / Download
                                    </a>
                                </div>

                                {isPdf(ordinance.file_url) ? (
                                    <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                                        <iframe
                                            title="Ordinance document preview"
                                            src={ordinance.file_url}
                                            className="h-[70vh] w-full bg-background"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Preview is available for PDF files. Use the download link above for this document type.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No document uploaded.</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

