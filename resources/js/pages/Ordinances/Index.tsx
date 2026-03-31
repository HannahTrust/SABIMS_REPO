import { Form, Head, Link, usePage } from '@inertiajs/react';
import { FileText, Plus, Search, Filter, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { ORDINANCE_STATUS_CONFIG, isOrdinanceStatus } from '@/constants/ordinance';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Ordinances', href: '/ordinances' }];

type CommitteeOption = { id: number; name: string };

type OrdinanceRow = {
    id: number;
    title: string;
    ordinance_number: string | null;
    status: string;
    created_at: string | null;
    committee: { id: number; name: string } | null;
};

type Props = {
    ordinances: OrdinanceRow[];
    filters: { q: string; status: string; committee_id: string; year: string };
    committees: CommitteeOption[];
    statuses: string[];
    canCreate: boolean;
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

export default function OrdinancesIndex({ ordinances, filters, committees, statuses, canCreate }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 8 }, (_, i) => String(currentYear - i));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ordinances" />

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
                            <h1 className="text-xl font-semibold leading-tight">Ordinances</h1>
                            <p className="text-xs text-muted-foreground">
                                {ordinances.length} {ordinances.length === 1 ? 'ordinance' : 'ordinances'} found
                            </p>
                        </div>
                    </div>
                    {canCreate && (
                        <Button asChild size="sm" className="gap-2 self-start sm:self-auto">
                            <Link href="/ordinances/create">
                                <Plus className="h-4 w-4" />
                                New Ordinance
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Search &amp; Filters
                        </p>
                    </div>
                    <div className="p-5">
                        <Form action="/ordinances" method="get" className="grid gap-4 sm:grid-cols-4">
                            {({ processing }) => (
                                <>
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="q" className="text-sm font-medium">
                                            Search
                                        </Label>
                                        <div className="relative mt-2">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="q"
                                                name="q"
                                                defaultValue={filters.q ?? ''}
                                                placeholder="Title or ordinance number…"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="status" className="text-sm font-medium">
                                            Status
                                        </Label>
                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue={filters.status ?? ''}
                                            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="">All</option>
                                            {statuses.map((st) => (
                                                <option key={st} value={st}>
                                                    {isOrdinanceStatus(st) ? ORDINANCE_STATUS_CONFIG[st].label : st}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="year" className="text-sm font-medium">
                                            Year
                                        </Label>
                                        <select
                                            id="year"
                                            name="year"
                                            defaultValue={filters.year ?? ''}
                                            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="">All</option>
                                            {years.map((y) => (
                                                <option key={y} value={y}>
                                                    {y}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Label htmlFor="committee_id" className="text-sm font-medium">
                                            Committee
                                        </Label>
                                        <select
                                            id="committee_id"
                                            name="committee_id"
                                            defaultValue={filters.committee_id ?? ''}
                                            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="">All committees</option>
                                            {committees.map((c) => (
                                                <option key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-end gap-2 sm:col-span-2 sm:justify-end">
                                        <Button type="submit" size="sm" className="gap-2" disabled={processing}>
                                            <Filter className="h-4 w-4" />
                                            Apply
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" asChild>
                                            <Link href="/ordinances">Reset</Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {ordinances.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-sidebar-border/70 py-16 text-center dark:border-sidebar-border">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">No ordinances found</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Try adjusting filters or create a new ordinance.
                            </p>
                        </div>
                        {canCreate && (
                            <Button asChild size="sm" variant="outline" className="mt-2 gap-2">
                                <Link href="/ordinances/create">
                                    <Plus className="h-4 w-4" />
                                    Create Ordinance
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border/70 bg-muted/40 dark:border-sidebar-border">
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Ordinance No.
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Committee
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                {ordinances.map((o) => (
                                    <tr key={o.id} className="group transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/ordinances/${o.id}`}
                                                className="font-mono text-sm font-semibold text-primary hover:underline"
                                            >
                                                {o.ordinance_number ?? '—'}
                                            </Link>
                                        </td>
                                        <td className="max-w-xs px-4 py-3">
                                            <span className="line-clamp-2 font-medium leading-snug">
                                                {o.title}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {o.committee?.name ? (
                                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                                    {o.committee.name}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/50">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={o.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                                {o.created_at ?? '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

