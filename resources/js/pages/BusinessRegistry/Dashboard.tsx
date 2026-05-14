import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';

type BarangayOpt = { id: number; name: string; code: string };

type Metrics = {
    total_businesses: number;
    active_businesses: number;
    closed_businesses: number;
    pending_businesses: number;
    new_registrations_30d: number;
    expired_permits: number;
    by_category: { name: string; count: number }[];
    by_purok: { name: string; count: number }[];
    permit_expiration_trend: { label: string; count: number }[];
};

type Props = {
    barangay_id?: number | null;
    barangay_name?: string | null;
    barangays?: BarangayOpt[];
    metrics?: Metrics | null;
    dashboard_scope?: 'global' | 'barangay';
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Business Registry', href: '/business-registry/dashboard' }];

function KpiCard({
    label,
    value,
    accent = 'blue',
    sub,
}: {
    label: string;
    value: number;
    accent?: 'blue' | 'teal' | 'amber' | 'purple';
    sub?: string;
}) {
    const accentIcon = {
        blue: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/25',
        teal: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25',
        amber: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25',
        purple: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/25',
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-5 shadow-sm',
                'dark:border-zinc-700/80 dark:bg-zinc-900/90',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
                <span
                    className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg text-base',
                        accentIcon[accent],
                    )}
                    aria-hidden="true"
                >
                    <Building2 className="size-4" />
                </span>
            </div>
            <div>
                <p className="text-[28px] font-medium leading-none tracking-tight text-foreground tabular-nums">
                    {value.toLocaleString()}
                </p>
                {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
            </div>
        </div>
    );
}

function HBarRow({ label, value, max, color = '#185FA5' }: { label: string; value: number; max: number; color?: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="min-w-0">
            <div className="mb-1.5 flex justify-between gap-2 text-[13px]">
                <span className="truncate font-normal text-foreground">{label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{value.toLocaleString()}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted dark:bg-zinc-800">
                <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

export default function BusinessRegistryDashboard({
    barangay_id,
    barangay_name,
    barangays = [],
    metrics,
    dashboard_scope = 'barangay',
}: Props) {
    const page = usePage();
    const { business_registry: br } = page.props as {
        business_registry?: { can_create?: boolean };
    };

    const showBarangayPicker = barangays.length > 0;
    const isGlobalView = dashboard_scope === 'global';

    const barMaxCat =
        metrics?.by_category?.reduce((m, r) => Math.max(m, r.count), 0) ?? (metrics?.total_businesses ?? 0);
    const barMaxPurok =
        metrics?.by_purok?.reduce((m, r) => Math.max(m, r.count), 0) ?? (metrics?.total_businesses ?? 0);
    const trendMax =
        metrics?.permit_expiration_trend?.reduce((m, r) => Math.max(m, r.count), 0) ?? 1;

    const createHref =
        barangay_id && barangay_id > 0
            ? `/business-registry/businesses/create?barangay_id=${barangay_id}`
            : '/business-registry/businesses/create';

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Business Registry dashboard" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-foreground">Business Registry</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Local business intelligence — registrations, permits, and clearances
                        </p>
                        {barangay_name ? (
                            <p className="mt-2 text-sm font-medium text-foreground">{barangay_name}</p>
                        ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {br?.can_create && (
                            <Button asChild>
                                <Link href={createHref}>Register business</Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/business-registry/businesses">Business directory</Link>
                        </Button>
                    </div>
                </div>

                {showBarangayPicker && (
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 dark:border-zinc-700/80 dark:bg-zinc-900/40">
                        <label htmlFor="br_barangay_id" className="text-[13px] font-medium text-muted-foreground">
                            Barangay scope
                        </label>
                        <select
                            id="br_barangay_id"
                            className={cn(
                                'max-w-[min(100%,340px)] flex-1 cursor-pointer rounded-md border border-border bg-muted px-2.5 py-1.5 text-[13px] text-foreground',
                                'dark:border-zinc-600 dark:bg-zinc-800',
                            )}
                            value={barangay_id ?? ''}
                            onChange={(e) => {
                                const v = e.target.value;
                                router.get(
                                    '/business-registry/dashboard',
                                    { barangay_id: v ? Number(v) : undefined },
                                    { preserveState: true, preserveScroll: true },
                                );
                            }}
                        >
                            <option value="">{isGlobalView ? 'All barangays (system-wide)' : 'Select barangay…'}</option>
                            {barangays.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({b.code})
                                </option>
                            ))}
                        </select>
                        {isGlobalView ? (
                            <span className="ml-auto rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-300">
                                System-wide
                            </span>
                        ) : null}
                    </div>
                )}

                {!metrics && (
                    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground dark:border-zinc-600">
                        No analytics context. Adjust filters or contact an administrator.
                    </div>
                )}

                {metrics && (
                    <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <KpiCard label="Total businesses" value={metrics.total_businesses} accent="blue" />
                            <KpiCard label="Active" value={metrics.active_businesses} accent="teal" />
                            <KpiCard label="Expired permits (active)" value={metrics.expired_permits} accent="amber" />
                            <KpiCard label="New (30 days)" value={metrics.new_registrations_30d} accent="purple" />
                            <KpiCard label="Closed" value={metrics.closed_businesses} accent="purple" />
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80 dark:bg-zinc-900/90">
                                <h2 className="mb-4 text-sm font-semibold text-foreground">Businesses by category</h2>
                                <div className="flex flex-col gap-4">
                                    {(metrics.by_category ?? []).map((row) => (
                                        <HBarRow key={row.name} label={row.name} value={row.count} max={barMaxCat || 1} />
                                    ))}
                                    {(metrics.by_category ?? []).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No category breakdown yet.</p>
                                    ) : null}
                                </div>
                            </div>
                            <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80 dark:bg-zinc-900/90">
                                <h2 className="mb-4 text-sm font-semibold text-foreground">Businesses per purok</h2>
                                <div className="flex flex-col gap-4">
                                    {(metrics.by_purok ?? []).map((row) => (
                                        <HBarRow key={row.name} label={row.name} value={row.count} max={barMaxPurok || 1} />
                                    ))}
                                    {(metrics.by_purok ?? []).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No purok breakdown yet.</p>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80 dark:bg-zinc-900/90">
                            <h2 className="mb-4 text-sm font-semibold text-foreground">Permit expiration trend (by month)</h2>
                            <div className="flex flex-wrap items-end gap-2">
                                {(metrics.permit_expiration_trend ?? []).map((row) => (
                                    <div key={row.label} className="flex flex-col items-center gap-1">
                                        <div
                                            className="w-7 rounded-t bg-blue-600/80 dark:bg-blue-500/70"
                                            style={{
                                                height: `${Math.max(6, trendMax ? (row.count / trendMax) * 96 : 0)}px`,
                                            }}
                                            title={`${row.count}`}
                                        />
                                        <span className="max-w-[52px] truncate text-[10px] text-muted-foreground">{row.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
