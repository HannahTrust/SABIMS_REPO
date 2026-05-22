import { Head, router } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { FormEvent } from 'react';
import { HBarRow, KpiCard, StatusDonut, VerticalBarChart } from '@/components/platform/platform-charts';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Platform', href: '/platform/tenants' },
    { title: 'Analytics', href: '/platform/analytics' },
];

type MunicipalityOpt = { id: number; name: string; code: string };

type Props = {
    filters: { municipality_id: number | null; days: number };
    municipalities: MunicipalityOpt[];
    kpis: Record<string, number>;
    tenant_status: { active: number; inactive: number };
    tenants_over_time: { label: string; count: number }[];
    barangays_per_tenant: { name: string; count: number }[];
    users_per_tenant: { name: string; count: number }[];
    users_by_role: { role: string; count: number }[];
    module_usage_per_tenant: {
        name: string;
        residents: number;
        businesses: number;
        blotter_reports: number;
    }[];
    audit_activity_by_day: { label: string; count: number }[];
    top_audit_modules: { name: string; count: number }[];
    new_users_over_time: { label: string; count: number }[];
};

export default function PlatformAnalyticsIndex({
    filters,
    municipalities,
    kpis,
    tenant_status,
    tenants_over_time,
    barangays_per_tenant,
    users_per_tenant,
    users_by_role,
    module_usage_per_tenant,
    audit_activity_by_day,
    top_audit_modules,
    new_users_over_time,
}: Props) {
    const barMax = barangays_per_tenant.reduce((m, r) => Math.max(m, r.count), 0) || 1;
    const userMax = users_per_tenant.reduce((m, r) => Math.max(m, r.count), 0) || 1;
    const roleMax = users_by_role.reduce((m, r) => Math.max(m, r.count), 0) || 1;
    const moduleMax = module_usage_per_tenant.reduce(
        (m, r) => Math.max(m, r.residents, r.businesses, r.blotter_reports),
        0,
    ) || 1;
    const auditModuleMax = top_audit_modules.reduce((m, r) => Math.max(m, r.count), 0) || 1;

    const onFilter = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        router.get('/platform/analytics', {
            municipality_id: fd.get('municipality_id') || undefined,
            days: fd.get('days') || 30,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Platform Analytics" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Platform analytics</h1>
                        <p className="text-sm text-muted-foreground">Cross-tenant adoption, usage, and activity.</p>
                    </div>
                </div>

                <form
                    onSubmit={onFilter}
                    className="flex flex-wrap items-end gap-3 rounded-xl border bg-muted/30 px-4 py-3"
                >
                    <div>
                        <label htmlFor="municipality_id" className="text-xs font-medium text-muted-foreground">
                            Tenant
                        </label>
                        <select
                            id="municipality_id"
                            name="municipality_id"
                            defaultValue={filters.municipality_id ?? ''}
                            className="mt-1 flex h-10 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">All tenants</option>
                            {municipalities.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="days" className="text-xs font-medium text-muted-foreground">
                            Period
                        </label>
                        <select
                            id="days"
                            name="days"
                            defaultValue={String(filters.days)}
                            className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="180">Last 180 days</option>
                        </select>
                    </div>
                    <Button type="submit" variant="secondary">
                        Apply
                    </Button>
                </form>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
                    <KpiCard label="Tenants" value={kpis.tenants ?? 0} />
                    <KpiCard label="Active tenants" value={kpis.active_tenants ?? 0} />
                    <KpiCard label="Barangays" value={kpis.barangays ?? 0} />
                    <KpiCard label="Users" value={kpis.users ?? 0} />
                    <KpiCard label="Residents" value={kpis.residents ?? 0} />
                    <KpiCard label="Businesses" value={kpis.businesses ?? 0} />
                    <KpiCard label="Incident reports" value={kpis.blotter_reports ?? 0} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold">Tenant status</h2>
                        <StatusDonut active={tenant_status.active} inactive={tenant_status.inactive} />
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold">New tenants over time</h2>
                        <VerticalBarChart data={tenants_over_time} />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold">Barangays per tenant</h2>
                        <div className="flex flex-col gap-3">
                            {barangays_per_tenant.map((r) => (
                                <HBarRow key={r.name} label={r.name} value={r.count} max={barMax} />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold">Users per tenant</h2>
                        <div className="flex flex-col gap-3">
                            {users_per_tenant.map((r) => (
                                <HBarRow key={r.name} label={r.name} value={r.count} max={userMax} color="#2563eb" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold">Users by role</h2>
                        <div className="flex flex-col gap-3">
                            {users_by_role.map((r) => (
                                <HBarRow key={r.role} label={r.role} value={r.count} max={roleMax} color="#059669" />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold">New users over time</h2>
                        <VerticalBarChart data={new_users_over_time} />
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <h2 className="mb-4 text-sm font-semibold">Module usage by tenant</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="pb-2 pr-4">Tenant</th>
                                    <th className="pb-2 pr-4">Residents</th>
                                    <th className="pb-2 pr-4">Businesses</th>
                                    <th className="pb-2">Incident reports</th>
                                </tr>
                            </thead>
                            <tbody>
                                {module_usage_per_tenant.map((row) => (
                                    <tr key={row.name} className="border-t">
                                        <td className="py-2 pr-4 font-medium">{row.name}</td>
                                        <td className="py-2 pr-4 tabular-nums">{row.residents}</td>
                                        <td className="py-2 pr-4 tabular-nums">{row.businesses}</td>
                                        <td className="py-2 tabular-nums">{row.blotter_reports}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {module_usage_per_tenant.length > 0 && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            {module_usage_per_tenant.slice(0, 3).map((row) => (
                                <div key={row.name} className="text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">{row.name}</p>
                                    <HBarRow label="Residents" value={row.residents} max={moduleMax} color="#0ea5e9" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold">Platform activity (audit log)</h2>
                        <VerticalBarChart data={audit_activity_by_day} maxHeight={120} />
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold">Top audit modules</h2>
                        <div className="flex flex-col gap-3">
                            {top_audit_modules.map((r) => (
                                <HBarRow key={r.name} label={r.name} value={r.count} max={auditModuleMax} color="#d97706" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
