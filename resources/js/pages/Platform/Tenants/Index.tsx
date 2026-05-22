import { Head, Link, router } from '@inertiajs/react';
import { Building2, Plus, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tenants', href: '/platform/tenants' }];

type TenantRow = {
    id: number;
    code: string;
    name: string;
    system_name: string;
    module_name: string | null;
    logo_url: string | null;
    is_active: boolean;
    barangays_count: number;
};

type Props = {
    tenants: TenantRow[];
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        from: number | null;
        to: number | null;
        prev_url: string | null;
        next_url: string | null;
    };
    filters: { search: string };
};

export default function TenantsIndex({ tenants, pagination, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/platform/tenants', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Tenant municipalities" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-400">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">Tenant municipalities</h1>
                            <p className="text-xs text-muted-foreground">
                                Manage LGU vendors: branding, status, and isolation.
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/platform/tenants/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New tenant
                        </Link>
                    </Button>
                </div>

                <form onSubmit={onSearch} className="flex max-w-md gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, code…"
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Tenant</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Barangays</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No tenants found.
                                    </td>
                                </tr>
                            ) : (
                                tenants.map((t) => (
                                    <tr key={t.id} className="border-t border-sidebar-border/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {t.logo_url ? (
                                                    <img
                                                        src={t.logo_url}
                                                        alt=""
                                                        className="h-9 w-9 rounded-md border object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-xs font-bold">
                                                        {t.system_name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{t.name}</div>
                                                    <div className="text-xs text-muted-foreground">{t.system_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{t.code}</td>
                                        <td className="px-4 py-3">{t.barangays_count}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={t.is_active ? 'default' : 'secondary'}>
                                                {t.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/platform/tenants/${t.id}/edit`}>Edit</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Showing {pagination.from}–{pagination.to} of {pagination.total}
                        </span>
                        <div className="flex gap-2">
                            {pagination.prev_url && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={pagination.prev_url}>Previous</Link>
                                </Button>
                            )}
                            {pagination.next_url && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={pagination.next_url}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
