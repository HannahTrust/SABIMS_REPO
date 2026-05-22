import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    Landmark,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Users,
    UsersRound,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Barangay management', href: '/management/barangays' }];

type BarangayRow = {
    id: number;
    code: string;
    name: string;
    municipality: string;
    municipality_name?: string | null;
    province: string;
    region: string;
    is_active: boolean;
    residents_count: number;
    puroks_count: number;
    current_officials_count: number;
    logo_url: string | null;
};

type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_url: string | null;
    next_url: string | null;
};

type Props = {
    barangays: BarangayRow[];
    pagination: Pagination;
    filters: { search: string; municipality_id: string; status: string };
    municipalities: { id: number; name: string; code: string }[];
    can: { create: boolean };
};

function StatusBadge({ active }: { active: boolean }) {
    return active ? (
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            Active
        </span>
    ) : (
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Inactive
        </span>
    );
}

export default function BarangaysIndex({ barangays, pagination, filters, municipalities, can }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Barangay management" />

            <div className="flex flex-1 flex-col gap-6">
                {flash?.status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200">
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            <Landmark className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">Barangay management</h1>
                            <p className="text-xs text-muted-foreground">
                                Master registry — {pagination.total}{' '}
                                {pagination.total === 1 ? 'barangay' : 'barangays'}
                            </p>
                        </div>
                    </div>
                    {can.create && (
                        <Button asChild size="sm" className="gap-2">
                            <Link href="/management/barangays/create">
                                <Plus className="h-4 w-4" />
                                New barangay
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Search &amp; filters
                        </p>
                    </div>
                    <div className="p-5">
                        <Form action="/management/barangays" method="get" className="grid gap-4 md:grid-cols-12">
                            {({ processing }) => (
                                <>
                                    <div className="md:col-span-4">
                                        <Label htmlFor="search" className="text-sm font-medium">
                                            Search
                                        </Label>
                                        <div className="relative mt-2">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                name="search"
                                                defaultValue={filters.search}
                                                placeholder="Name, code, municipality…"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-3">
                                        <Label htmlFor="municipality_id" className="text-sm font-medium">
                                            Tenant municipality
                                        </Label>
                                        <select
                                            id="municipality_id"
                                            name="municipality_id"
                                            defaultValue={filters.municipality_id}
                                            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">All</option>
                                            {municipalities.map((m) => (
                                                <option key={m.id} value={String(m.id)}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <Label htmlFor="status" className="text-sm font-medium">
                                            Status
                                        </Label>
                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue={filters.status}
                                            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">All</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end gap-2 md:col-span-2">
                                        <Button type="submit" disabled={processing} className="w-full">
                                            Apply
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[920px] text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:border-sidebar-border">
                                <tr>
                                    <th className="px-4 py-3">Barangay</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-center">Residents</th>
                                    <th className="px-4 py-3 text-center">Puroks</th>
                                    <th className="px-4 py-3 text-center">Officials</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/60 dark:divide-sidebar-border">
                                {barangays.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                            No barangays match your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    barangays.map((b) => (
                                        <tr key={b.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sidebar-border/60 bg-muted/40">
                                                        {b.logo_url ? (
                                                            <img
                                                                src={b.logo_url}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{b.name}</div>
                                                        <div className="text-xs text-muted-foreground">{b.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <div className="max-w-[220px] truncate">
                                                    {b.municipality_name ?? b.municipality ?? '—'}
                                                </div>
                                                <div className="text-xs">{b.province}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge active={b.is_active} />
                                            </td>
                                            <td className="px-4 py-3 text-center tabular-nums">
                                                <span className="inline-flex items-center justify-center gap-1">
                                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {b.residents_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center tabular-nums">{b.puroks_count}</td>
                                            <td className="px-4 py-3 text-center tabular-nums">
                                                <span className="inline-flex items-center justify-center gap-1">
                                                    <UsersRound className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {b.current_officials_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/management/barangays/${b.id}/edit`}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit &amp; profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/management/barangays/${b.id}/officials`}>
                                                                <UsersRound className="mr-2 h-4 w-4" />
                                                                Manage officials
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/management/barangays/${b.id}/puroks`}>
                                                                <Building2 className="mr-2 h-4 w-4" />
                                                                Manage puroks
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-sidebar-border/70 px-4 py-3 text-sm sm:flex-row dark:border-sidebar-border">
                            <p className="text-muted-foreground">
                                {pagination.from != null && pagination.to != null ? (
                                    <>
                                        Showing {pagination.from}–{pagination.to} of {pagination.total}
                                    </>
                                ) : (
                                    <>Page {pagination.current_page}</>
                                )}
                            </p>
                            <div className="flex items-center gap-2">
                                {pagination.prev_url ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={pagination.prev_url} preserveScroll preserveState>
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Prev
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" disabled>
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Prev
                                    </Button>
                                )}
                                <span className="tabular-nums text-muted-foreground">
                                    {pagination.current_page} / {pagination.last_page}
                                </span>
                                {pagination.next_url ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={pagination.next_url} preserveScroll preserveState>
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" disabled>
                                        Next
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
