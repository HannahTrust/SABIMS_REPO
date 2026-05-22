import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    FileDown,
    MapPin,
    Pencil,
    Trash2,
    User,
    Users,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { INCIDENT_REPORT_STATUS_CONFIG, isIncidentReportStatus } from '@/constants/incident-report';
import type { BreadcrumbItem } from '@/types';

type Witness = { id: number; name: string; contact: string | null; statement: string | null };
type Attachment = { id: number; file_name: string; file_url: string };

type Report = {
    id: number;
    report_number: string;
    purok_id: number | null;
    incident_type: { id: number; name: string } | null;
    complainant: { id: number; name: string } | null;
    respondent: { id: number; name: string } | null;
    respondent_name: string | null;
    incident_datetime: string | null;
    incident_location: string;
    narrative: string;
    action_taken: string | null;
    remarks: string | null;
    assigned_officer: { id: number; name: string } | null;
    status: string;
    settlement_date: string | null;
    barangay: { id: number; name: string; code: string } | null;
    witnesses: Witness[];
    attachments: Attachment[];
    created_at: string | null;
    updated_at: string | null;
};

type Props = {
    report: Report;
    canEdit: boolean;
    canResolve: boolean;
    canArchive: boolean;
    canDelete: boolean;
    canPrint: boolean;
};

function StatusBadge({ status }: { status: string }) {
    const config = isIncidentReportStatus(status)
        ? INCIDENT_REPORT_STATUS_CONFIG[status]
        : { label: status, className: 'bg-muted text-muted-foreground border-border' };

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}

export default function IncidentReportShow({
    report,
    canEdit,
    canResolve,
    canArchive,
    canDelete,
    canPrint,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Incident Reports', href: '/incident-reports' },
        { title: report.report_number, href: `/incident-reports/${report.id}` },
    ];

    const respondentLabel = report.respondent?.name ?? report.respondent_name ?? 'N/A';

    const handleDelete = () => {
        if (!confirm(`Delete incident report ${report.report_number}? This cannot be undone.`)) {
            return;
        }
        router.delete(`/incident-reports/${report.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={`Incident Report ${report.report_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {flash?.status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold leading-tight">{report.report_number}</h1>
                                <StatusBadge status={report.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {report.incident_type?.name ?? 'Incident'} · {report.barangay?.name ?? 'Barangay'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
                            <Link href="/incident-reports">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        {canEdit && (
                            <Button size="sm" asChild className="gap-1.5">
                                <Link href={`/incident-reports/${report.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {canPrint && (
                            <Button size="sm" variant="outline" asChild className="gap-1.5">
                                <a href={`/incident-reports/${report.id}/print`} target="_blank" rel="noreferrer">
                                    <FileDown className="h-4 w-4" />
                                    Print
                                </a>
                            </Button>
                        )}
                        {canResolve && report.status !== 'resolved' && (
                            <Form action={`/incident-reports/${report.id}/resolve`} method="post" className="inline">
                                <Button type="submit" size="sm" variant="outline" className="gap-1.5">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Mark Resolved
                                </Button>
                            </Form>
                        )}
                        {canArchive && report.status !== 'archived' && (
                            <Form action={`/incident-reports/${report.id}/archive`} method="post" className="inline">
                                <Button type="submit" size="sm" variant="outline" className="gap-1.5">
                                    <Archive className="h-4 w-4" />
                                    Archive
                                </Button>
                            </Form>
                        )}
                        {canDelete && (
                            <Button type="button" size="sm" variant="destructive" className="gap-1.5" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <section className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                            <h2 className="text-sm font-semibold">Incident Details</h2>
                            <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
                                <div>
                                    <dt className="text-xs text-muted-foreground">Incident Type</dt>
                                    <dd className="mt-1 font-medium">{report.incident_type?.name ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">Date & Time</dt>
                                    <dd className="mt-1 font-medium">
                                        {report.incident_datetime ? new Date(report.incident_datetime).toLocaleString() : '—'}
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" /> Location
                                    </dt>
                                    <dd className="mt-1">{report.incident_location}</dd>
                                </div>
                                {report.purok_id && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground">Purok</dt>
                                        <dd className="mt-1">Purok {report.purok_id}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>

                        <section className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                            <h2 className="text-sm font-semibold">Narrative</h2>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{report.narrative}</p>
                            {report.action_taken && (
                                <>
                                    <h3 className="mt-6 text-sm font-semibold">Action Taken</h3>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{report.action_taken}</p>
                                </>
                            )}
                            {report.remarks && (
                                <>
                                    <h3 className="mt-6 text-sm font-semibold">Remarks</h3>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{report.remarks}</p>
                                </>
                            )}
                        </section>

                        {report.witnesses.length > 0 && (
                            <section className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <h2 className="flex items-center gap-2 text-sm font-semibold">
                                    <Users className="h-4 w-4" />
                                    Witnesses ({report.witnesses.length})
                                </h2>
                                <ul className="mt-4 space-y-4">
                                    {report.witnesses.map((witness, index) => (
                                        <li key={witness.id} className="rounded-lg border p-3 text-sm">
                                            <p className="font-medium">
                                                {index + 1}. {witness.name}
                                            </p>
                                            {witness.contact && (
                                                <p className="mt-1 text-xs text-muted-foreground">Contact: {witness.contact}</p>
                                            )}
                                            {witness.statement && (
                                                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{witness.statement}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                            <h2 className="text-sm font-semibold">Parties</h2>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div>
                                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" /> Complainant
                                    </dt>
                                    <dd className="mt-1 font-medium">{report.complainant?.name ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" /> Respondent
                                    </dt>
                                    <dd className="mt-1 font-medium">{respondentLabel}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">Assigned Officer</dt>
                                    <dd className="mt-1">{report.assigned_officer?.name ?? 'Unassigned'}</dd>
                                </div>
                                {report.settlement_date && (
                                    <div>
                                        <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" /> Settlement Date
                                        </dt>
                                        <dd className="mt-1">{report.settlement_date}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>

                        {report.attachments.length > 0 && (
                            <section className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <h2 className="text-sm font-semibold">Attachments</h2>
                                <ul className="mt-3 space-y-2 text-sm">
                                    {report.attachments.map((file) => (
                                        <li key={file.id}>
                                            <a
                                                href={file.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary underline-offset-4 hover:underline"
                                            >
                                                {file.file_name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section className="rounded-xl border border-sidebar-border/70 p-5 text-xs text-muted-foreground dark:border-sidebar-border">
                            <p>Created: {report.created_at ? new Date(report.created_at).toLocaleString() : '—'}</p>
                            <p className="mt-1">Updated: {report.updated_at ? new Date(report.updated_at).toLocaleString() : '—'}</p>
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
