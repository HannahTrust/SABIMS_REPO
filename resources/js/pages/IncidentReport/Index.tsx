import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AlertTriangle, Eye, FileDown, FileText, Filter, Pencil, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INCIDENT_REPORT_STATUS_CONFIG, isIncidentReportStatus } from '@/constants/incident-report';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Incident Reports', href: '/incident-reports' }];

type IncidentReportRow = {
    id: number;
    report_number: string;
    incident_type: string;
    complainant: string;
    respondent: string | null;
    incident_datetime: string;
    status: string;
    purok: string | null;
};

type PaginatorLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    incidentReports?: {
        data: IncidentReportRow[];
        links?: PaginatorLink[];
    };
    incidentTypes?: string[];
    puroks?: string[];
    filters?: {
        search?: string;
        status?: string;
        incident_type?: string;
        purok?: string;
        date_from?: string;
        date_to?: string;
    };
    canCreate?: boolean;
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

export default function IncidentReportIndex({
    incidentReports,
    incidentTypes = [],
    puroks = [],
    filters,
    canCreate = false,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [incidentType, setIncidentType] = useState(filters?.incident_type ?? '');
    const [purok, setPurok] = useState(filters?.purok ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');

    const rows = incidentReports?.data ?? [];
    const activeFilterCount = [status, incidentType, purok, dateFrom, dateTo, search].filter(Boolean).length;

    const applyFilters = () => {
        router.get(
            '/incident-reports',
            {
                search: search || undefined,
                status: status || undefined,
                incident_type: incidentType || undefined,
                purok: purok || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setIncidentType('');
        setPurok('');
        setDateFrom('');
        setDateTo('');
        router.get('/incident-reports', {}, { preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Incident Reports" />

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
                            <h1 className="text-xl font-semibold leading-tight">Incident Reports</h1>
                            <p className="text-xs text-muted-foreground">Barangay incident logs, mediation, and case monitoring</p>
                        </div>
                    </div>
                    {canCreate && (
                        <Link href="/incident-reports/create">
                            <Button>New Incident Report</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="grid gap-3 lg:grid-cols-12">
                        <div className="relative lg:col-span-3">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Search report no., names..."
                                className="pl-9"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm lg:col-span-2"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="under_mediation">Under Mediation</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="resolved">Resolved</option>
                            <option value="elevated">Elevated</option>
                            <option value="archived">Archived</option>
                        </select>

                        <select
                            value={incidentType}
                            onChange={(e) => setIncidentType(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm lg:col-span-2"
                        >
                            <option value="">All Incident Types</option>
                            {incidentTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>

                        <select
                            value={purok}
                            onChange={(e) => setPurok(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm lg:col-span-2"
                        >
                            <option value="">All Puroks</option>
                            {puroks.map((p) => (
                                <option key={p} value={p}>
                                    {`Purok ${p}`}
                                </option>
                            ))}
                        </select>

                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="lg:col-span-1" />
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="lg:col-span-1" />

                        <div className="flex items-center gap-2 lg:col-span-1">
                            <Button variant="outline" onClick={resetFilters}>
                                Reset
                            </Button>
                            <Button onClick={applyFilters}>Apply</Button>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Filter className="h-3.5 w-3.5" />
                        {activeFilterCount > 0 ? `${activeFilterCount} filter(s) active` : 'No active filters'}
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {rows.length === 0 ? (
                        <div className="p-10 text-center">
                            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-3 text-sm font-medium">No incident reports found.</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Try adjusting your filters or create a new incident report.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/70 bg-muted/40 dark:border-sidebar-border">
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Report No.</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Incident Type</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Complainant</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Respondent</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                        {rows.map((row) => (
                                            <tr key={row.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3 font-medium">{row.report_number}</td>
                                                <td className="px-4 py-3">{row.incident_type}</td>
                                                <td className="px-4 py-3">{row.complainant}</td>
                                                <td className="px-4 py-3">{row.respondent ?? 'N/A'}</td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(row.incident_datetime).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={row.status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/incident-reports/${row.id}`}>
                                                            <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5">
                                                                <Eye className="h-3.5 w-3.5" />
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/incident-reports/${row.id}/edit`}>
                                                            <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5">
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                        <a href={`/incident-reports/${row.id}/print`} target="_blank" rel="noreferrer">
                                                            <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5">
                                                                <FileDown className="h-3.5 w-3.5" />
                                                                Print
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid gap-3 p-3 md:hidden">
                                {rows.map((row) => (
                                    <div key={row.id} className="rounded-lg border border-sidebar-border/70 p-3 dark:border-sidebar-border">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium">{row.report_number}</p>
                                            <StatusBadge status={row.status} />
                                        </div>
                                        <p className="mt-2 text-sm">{row.incident_type}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {row.complainant} vs {row.respondent ?? 'N/A'}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {new Date(row.incident_datetime).toLocaleString()}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Link href={`/incident-reports/${row.id}`}>
                                                <Button size="sm" variant="outline">
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={`/incident-reports/${row.id}/edit`}>
                                                <Button size="sm" variant="outline">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <a href={`/incident-reports/${row.id}/print`} target="_blank" rel="noreferrer">
                                                <Button size="sm" variant="outline">
                                                    Print
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {(incidentReports?.links?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {incidentReports?.links?.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                className={`rounded-md border px-3 py-1.5 text-xs ${
                                    link.active
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-sidebar-border/70 hover:bg-muted dark:border-sidebar-border'
                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
