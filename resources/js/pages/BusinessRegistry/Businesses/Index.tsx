import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Building2, Filter, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Row = {
    id: number;
    business_name: string;
    business_code: string;
    owner_name: string;
    status: string;
    permit_number: string | null;
    permit_expiration_date: string | null;
    category: { id: number; name: string } | null;
    barangay: { id: number; name: string } | null;
    purok: { id: number; name: string } | null;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Props = {
    barangay: { id: number; name: string } | null;
    barangays: { id: number; name: string; code: string }[];
    businesses: Paginated<Row>;
    puroks: { id: number; name: string; code: string | null }[];
    categories: { id: number; name: string; code: string }[];
    filters: Record<string, string | number | undefined | null>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Business Registry', href: '/business-registry/dashboard' },
    { title: 'Directory', href: '/business-registry/businesses' },
];

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function permitBadge(exp: string | null) {
    if (!exp) return { label: 'No permit date', className: 'bg-muted text-muted-foreground' };
    const d = new Date(exp);
    const past = d < new Date(new Date().toDateString());
    if (past) return { label: 'Expired', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' };
    return { label: 'Valid', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' };
}

export default function BusinessesIndex({ barangay, barangays, businesses, puroks, categories, filters }: Props) {
    const page = usePage();
    const { business_registry: br, flash } = page.props as {
        business_registry?: { can_create?: boolean };
        flash?: { status?: string };
    };

    const [search, setSearch] = useState(String(filters.search ?? ''));

    const queryBase = useMemo(() => {
        const q: Record<string, string | number> = {};
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                q[k] = v as string | number;
            }
        });
        return q;
    }, [filters]);

    const querySuffix = page.url.includes('?') ? page.url.slice(page.url.indexOf('?')) : '';

    function apply(extra: Record<string, string | undefined>) {
        router.get('/business-registry/businesses', { ...queryBase, ...extra }, { preserveState: true, replace: true });
    }

    const createHref =
        barangay?.id && barangay.id > 0
            ? `/business-registry/businesses/create?barangay_id=${barangay.id}`
            : filters.barangay_id
              ? `/business-registry/businesses/create?barangay_id=${filters.barangay_id}`
              : '/business-registry/businesses/create';

    const canPickBarangay = barangays.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Business directory" />

            <div className="flex flex-col gap-6">
                {flash?.status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200">
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Business directory</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {barangay?.name ?? 'All accessible barangays'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {br?.can_create && (
                            <Button asChild>
                                <Link href={createHref}>Register business</Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={`/business-registry/businesses/export/csv${querySuffix}`}>Export CSV</Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-4 dark:border-zinc-700/80 dark:bg-zinc-900/90">
                    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
                        {canPickBarangay && (
                            <div className="grid gap-2 lg:max-w-xs">
                                <Label>Barangay</Label>
                                <select
                                    className={selectClass}
                                    value={filters.barangay_id ?? ''}
                                    onChange={(e) =>
                                        apply({
                                            barangay_id: e.target.value || undefined,
                                            purok_id: undefined,
                                        })
                                    }
                                >
                                    <option value="">All barangays</option>
                                    {barangays.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="grid min-w-[200px] flex-1 gap-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            apply({ search: search || undefined });
                                        }
                                    }}
                                    placeholder="Name, code, owner, permit…"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2 lg:max-w-[200px]">
                            <Label>Category</Label>
                            <select
                                className={selectClass}
                                value={filters.business_category_id ?? ''}
                                onChange={(e) => apply({ business_category_id: e.target.value || undefined })}
                            >
                                <option value="">All</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2 lg:max-w-[200px]">
                            <Label>Purok</Label>
                            <select
                                className={selectClass}
                                value={filters.purok_id ?? ''}
                                onChange={(e) => apply({ purok_id: e.target.value || undefined })}
                                disabled={puroks.length === 0}
                            >
                                <option value="">All</option>
                                {puroks.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2 lg:max-w-[160px]">
                            <Label>Status</Label>
                            <select
                                className={selectClass}
                                value={filters.status ?? ''}
                                onChange={(e) => apply({ status: e.target.value || undefined })}
                            >
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div className="grid gap-2 lg:max-w-[180px]">
                            <Label>Permit</Label>
                            <select
                                className={selectClass}
                                value={filters.permit_filter ?? ''}
                                onChange={(e) => apply({ permit_filter: e.target.value || undefined })}
                            >
                                <option value="">Any</option>
                                <option value="valid">Valid / no expiry</option>
                                <option value="expired">Expired</option>
                                <option value="none">No permit recorded</option>
                            </select>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            className="lg:mt-6"
                            onClick={() => apply({ search: search || undefined })}
                        >
                            <Filter className="mr-1.5 size-4" />
                            Apply
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/80 dark:border-zinc-700/80">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b bg-muted/50 text-[13px] font-medium text-muted-foreground dark:bg-zinc-800/50">
                            <tr>
                                <th className="px-4 py-3">Business</th>
                                <th className="px-4 py-3">Owner</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Barangay</th>
                                <th className="px-4 py-3">Purok</th>
                                <th className="px-4 py-3">Permit</th>
                                <th className="px-4 py-3">Expiration</th>
                                <th className="px-4 py-3 w-[100px]" />
                            </tr>
                        </thead>
                        <tbody>
                            {businesses.data.map((b) => {
                                const pb = permitBadge(b.permit_expiration_date);
                                return (
                                    <tr
                                        key={b.id}
                                        className="border-b border-border/60 last:border-0 dark:border-zinc-800"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-start gap-2">
                                                <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium text-foreground">{b.business_name}</div>
                                                    <div className="text-xs text-muted-foreground">{b.business_code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{b.owner_name}</td>
                                        <td className="px-4 py-3">{b.category?.name ?? '—'}</td>
                                        <td className="px-4 py-3">{b.barangay?.name ?? '—'}</td>
                                        <td className="px-4 py-3">{b.purok?.name ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${pb.className}`}
                                            >
                                                {pb.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 tabular-nums text-muted-foreground">
                                            {b.permit_expiration_date ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/business-registry/businesses/${b.id}`}>View</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {businesses.data.length === 0 && (
                        <div className="px-4 py-10 text-center text-sm text-muted-foreground">No businesses found.</div>
                    )}
                </div>

                {businesses.last_page > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {businesses.links.map((l, i) =>
                            l.url ? (
                                <Button
                                    key={i}
                                    variant={l.active ? 'default' : 'outline'}
                                    size="sm"
                                    asChild
                                >
                                    <Link href={l.url} preserveScroll>
                                        <span dangerouslySetInnerHTML={{ __html: l.label }} />
                                    </Link>
                                </Button>
                            ) : (
                                <Button key={i} variant="outline" size="sm" disabled>
                                    <span dangerouslySetInnerHTML={{ __html: l.label }} />
                                </Button>
                            ),
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
