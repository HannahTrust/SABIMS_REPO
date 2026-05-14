import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type ResidentRow = {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    birth_date: string | null;
    age: number;
    gender: string;
    civil_status: string;
    voter_status: boolean;
    senior_citizen: boolean;
    status: string;
    purok: { id: number; name: string } | null;
    household: { id: number; household_code: string } | null;
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
    barangay: { id: number; name: string };
    residents: Paginated<ResidentRow>;
    puroks: { id: number; name: string; code: string | null }[];
    filters: Record<string, string | number | undefined | null>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Population', href: '/residents/dashboard' },
    { title: 'Residents', href: '/residents' },
];

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function ResidentsIndex({ barangay, residents, puroks, filters }: Props) {
    const page = usePage();
    const { census } = page.props as {
        census?: { can_create?: boolean; can_update?: boolean };
    };
    const [search, setSearch] = useState(String(filters.search ?? ''));
    const { flash } = page.props as { flash?: { status?: string } };

    const querySuffix = page.url.includes('?') ? page.url.slice(page.url.indexOf('?')) : '';

    const queryBase = useMemo(() => {
        const q: Record<string, string | number> = {};
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                q[k] = v as string | number;
            }
        });
        return q;
    }, [filters]);

    function applyFilters(extra: Record<string, string | undefined>) {
        router.get('/residents', { ...queryBase, ...extra }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Residents" />

            <div className="flex flex-col gap-6">
                {flash?.status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200">
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Residents</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{barangay.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {census?.can_create && (
                            <Button asChild>
                                <Link href={`/residents/create${querySuffix}`}>Add resident</Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={`/residents/export/csv${querySuffix}`}>Export CSV</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/residents/export/print${querySuffix}`} target="_blank">
                                Print / Save PDF
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/residents/dashboard">Dashboard</Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <Filter className="size-4" />
                        Filters
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
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
                                            applyFilters({ search: search.trim() || undefined });
                                        }
                                    }}
                                    placeholder="Name…"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="purok_id">Purok</Label>
                            <select
                                id="purok_id"
                                className={selectClass}
                                value={String(filters.purok_id ?? '')}
                                onChange={(e) =>
                                    applyFilters({ purok_id: e.target.value || undefined })
                                }
                            >
                                <option value="">All</option>
                                {puroks.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="gender">Gender</Label>
                            <select
                                id="gender"
                                className={selectClass}
                                value={String(filters.gender ?? '')}
                                onChange={(e) =>
                                    applyFilters({ gender: e.target.value || undefined })
                                }
                            >
                                <option value="">All</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="voter_status">Voter</Label>
                            <select
                                id="voter_status"
                                className={selectClass}
                                value={
                                    filters.voter_status === undefined || filters.voter_status === ''
                                        ? ''
                                        : String(filters.voter_status)
                                }
                                onChange={(e) =>
                                    applyFilters({
                                        voter_status: e.target.value === '' ? undefined : e.target.value,
                                    })
                                }
                            >
                                <option value="">All</option>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b bg-slate-50/80 text-xs uppercase text-muted-foreground dark:bg-slate-900/40">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Purok</th>
                                <th className="px-4 py-3">Age</th>
                                <th className="px-4 py-3">Gender</th>
                                <th className="px-4 py-3">Voter</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {residents.data.map((r) => (
                                <tr key={r.id}>
                                    <td className="px-4 py-3 font-medium">
                                        {[r.first_name, r.middle_name, r.last_name, r.suffix]
                                            .filter(Boolean)
                                            .join(' ')}
                                    </td>
                                    <td className="px-4 py-3">{r.purok?.name ?? '—'}</td>
                                    <td className="px-4 py-3 tabular-nums">{r.age}</td>
                                    <td className="px-4 py-3">{r.gender}</td>
                                    <td className="px-4 py-3">{r.voter_status ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 capitalize">{r.status}</td>
                                    <td className="px-4 py-3 text-right">
                                        {census?.can_update && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/residents/${r.id}/edit`}>Edit</Link>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {residents.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {residents.links.map((link, i) => (
                            <Button
                                key={i}
                                type="button"
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url}
                            >
                                {link.url ? (
                                    <Link href={link.url} preserveState>
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Link>
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
