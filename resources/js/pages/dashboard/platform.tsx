import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, BarChart3, Building2, FileText, Plus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HBarRow, KpiCard } from '@/components/platform/platform-charts';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Platform Dashboard', href: dashboard().url }];

type TenantRow = {
    id: number;
    code: string;
    name: string;
    system_name: string;
    logo_url: string | null;
    is_active: boolean;
    barangays_count: number;
    users_count: number;
    created_at: string | null;
};

type ActivityRow = {
    id: number;
    action: string;
    module: string;
    description: string;
    user_name: string;
    created_at: string | null;
};

type Alert = { type: string; message: string };

type Props = {
    kpis: {
        total_tenants: number;
        active_tenants: number;
        inactive_tenants: number;
        new_tenants_30d: number;
        total_barangays: number;
        total_users: number;
    };
    recent_tenants: TenantRow[];
    alerts: Alert[];
    recent_activity: ActivityRow[];
    barangays_per_tenant: { name: string; count: number }[];
    users_per_tenant: { name: string; count: number }[];
};

export default function PlatformDashboard({
    kpis,
    recent_tenants,
    alerts,
    recent_activity,
    barangays_per_tenant,
    users_per_tenant,
}: Props) {
    const barMax = barangays_per_tenant.reduce((m, r) => Math.max(m, r.count), 0) || 1;
    const userMax = users_per_tenant.reduce((m, r) => Math.max(m, r.count), 0) || 1;

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Platform Dashboard" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Platform operations</h1>
                        <p className="text-sm text-muted-foreground">Vendor overview across all tenant municipalities.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href="/platform/tenants/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New tenant
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/platform/analytics">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Analytics
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/platform/reports">
                                <FileText className="mr-2 h-4 w-4" />
                                Reports
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    <KpiCard label="Total tenants" value={kpis.total_tenants} />
                    <KpiCard label="Active tenants" value={kpis.active_tenants} sub={`${kpis.inactive_tenants} inactive`} />
                    <KpiCard label="New tenants (30d)" value={kpis.new_tenants_30d} />
                    <KpiCard label="Total barangays" value={kpis.total_barangays} />
                    <KpiCard label="Total users" value={kpis.total_users} />
                    <KpiCard label="Inactive tenants" value={kpis.inactive_tenants} />
                </div>

                {alerts.length > 0 && (
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                            <AlertTriangle className="h-4 w-4" />
                            Needs attention
                        </div>
                        <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-100/90">
                            {alerts.map((a, i) => (
                                <li key={i}>{a.message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Recent tenants</h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/platform/tenants">View all</Link>
                            </Button>
                        </div>
                        <div className="overflow-hidden rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-3 py-2">Tenant</th>
                                        <th className="px-3 py-2">Barangays</th>
                                        <th className="px-3 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_tenants.map((t) => (
                                        <tr key={t.id} className="border-t">
                                            <td className="px-3 py-2">
                                                <Link
                                                    href={`/platform/tenants/${t.id}/edit`}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {t.name}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">{t.system_name}</p>
                                            </td>
                                            <td className="px-3 py-2 tabular-nums">{t.barangays_count}</td>
                                            <td className="px-3 py-2">
                                                <Badge variant={t.is_active ? 'default' : 'secondary'}>
                                                    {t.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold">Recent platform activity</h2>
                        <ul className="max-h-[320px] space-y-3 overflow-y-auto text-sm">
                            {recent_activity.length === 0 ? (
                                <li className="text-muted-foreground">No audit activity yet.</li>
                            ) : (
                                recent_activity.map((a) => (
                                    <li key={a.id} className="border-b border-border/50 pb-2 last:border-0">
                                        <p className="font-medium">{a.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {a.user_name} · {a.module} · {a.action}
                                            {a.created_at ? ` · ${a.created_at}` : ''}
                                        </p>
                                    </li>
                                ))
                            )}
                        </ul>
                        <Button variant="link" size="sm" className="mt-3 px-0" asChild>
                            <Link href="/platform/reports">View reports</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                            <Building2 className="h-4 w-4" />
                            Barangays per tenant
                        </h2>
                        <div className="flex flex-col gap-3">
                            {barangays_per_tenant.map((r) => (
                                <HBarRow key={r.name} label={r.name} value={r.count} max={barMax} color="#2563eb" />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                            <Users className="h-4 w-4" />
                            Users per tenant
                        </h2>
                        <div className="flex flex-col gap-3">
                            {users_per_tenant.map((r) => (
                                <HBarRow key={r.name} label={r.name} value={r.count} max={userMax} color="#7c3aed" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
