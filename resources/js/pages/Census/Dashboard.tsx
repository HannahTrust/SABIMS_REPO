import { Head, Link, router, usePage } from '@inertiajs/react';
import ChartJS from 'chart.js/auto';
import type { Chart as ChartInstance } from 'chart.js';
import { AlertCircle } from 'lucide-react';
import { useMemo, useRef, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Population', href: '/residents/dashboard' }];

type BarangayOpt = { id: number; name: string; code: string };

type Metrics = {
    total_residents: number;
    total_households: number;
    active_residents: number;
    male: number;
    female: number;
    seniors: number;
    minors: number;
    pwd: number;
    voters: number;
    by_purok: { name: string; count: number }[];
    by_barangay?: { name: string; count: number }[];
    gender_distribution: { male: number; female: number; other: number };
    age_brackets: { label: string; count: number }[];
};

type Props = {
    barangay_id?: number | null;
    barangay_name?: string | null;
    barangays?: BarangayOpt[];
    metrics?: Metrics | null;
    dashboard_scope?: 'global' | 'barangay';
};

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
    label,
    value,
    icon,
    accent = 'blue',
    sub,
}: {
    label: string;
    value: number;
    icon: string;
    accent?: 'blue' | 'teal' | 'amber' | 'purple';
    sub?: string;
}) {
    const accentIcon = {
        blue: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/25 dark:bg-blue-500/20 dark:text-blue-300',
        teal: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-300',
        amber: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25 dark:bg-amber-500/20 dark:text-amber-300',
        purple: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/25 dark:bg-violet-500/20 dark:text-violet-300',
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-colors',
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
                    <i className={`ti ${icon}`} />
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

// ─── Horizontal bar row ───────────────────────────────────────────────────────

function HBarRow({
    label,
    value,
    max,
    color = '#185FA5',
    showPct = false,
    total = 0,
}: {
    label: string;
    value: number;
    max: number;
    color?: string;
    showPct?: boolean;
    total?: number;
}) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    const displayPct = showPct && total > 0 ? ((value / total) * 100).toFixed(1) + '%' : null;

    return (
        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <div className="min-w-0">
                <div className="mb-1.5 flex justify-between gap-2 text-[13px]">
                    <span className="font-normal text-foreground">{label}</span>
                    <span className="shrink-0 tabular-nums tracking-tight text-muted-foreground">
                        {value.toLocaleString()}
                        {displayPct ? (
                            <span className="ml-1.5 text-[11px] opacity-80">{displayPct}</span>
                        ) : null}
                    </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted dark:bg-zinc-800">
                    <div
                        className="h-full rounded-full transition-[width] duration-500 ease-out"
                        style={{
                            width: `${pct}%`,
                            background: color,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Chart.js horizontal bar ─────────────────────────────────────────────────

function BarangayBarChart({ rows }: { rows: { name: string; count: number }[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartInstance | null>(null);
    const height = Math.max(260, rows.length * 38 + 80);

    useEffect(() => {
        if (!canvasRef.current) return;
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
        const labelColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
        const barColor = isDark ? '#3b82f6' : '#185FA5';

        // destroy prior
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        chartRef.current = new ChartJS(canvasRef.current, {
            type: 'bar',
            data: {
                labels: rows.map((r) => r.name),
                datasets: [
                    {
                        label: 'Residents',
                        data: rows.map((r) => r.count),
                        backgroundColor: barColor,
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                ],
            },
            options: {
                indexAxis: 'y' as const,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#1e2024' : '#fff',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        borderWidth: 1,
                        titleColor: isDark ? '#e8eaed' : '#1a1a1a',
                        bodyColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx: any) => ` ${ctx.parsed.x.toLocaleString()} residents`,
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: {
                            color: labelColor,
                            font: { size: 11 },
                            callback: (v: string | number) => {
                                const n = typeof v === 'number' ? v : Number(v);

                                return Number.isFinite(n) ? n.toLocaleString() : String(v);
                            },
                        },
                        border: { display: false },
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            color: labelColor,
                            font: { size: 12 },
                            crossAlign: 'far' as const,
                        },
                        border: { display: false },
                    },
                },
            },
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [rows]);

    return (
        <div style={{ position: 'relative', width: '100%', height }}>
            <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Horizontal bar chart showing resident counts per barangay.`}
            >
                {rows.map((r) => `${r.name}: ${r.count}`).join(', ')}
            </canvas>
        </div>
    );
}

// ─── Age brackets donut chart ─────────────────────────────────────────────────

function AgeBracketsChart({ brackets }: { brackets: { label: string; count: number }[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartInstance | null>(null);

    const COLORS = [
        '#185FA5', '#0F6E56', '#534AB7', '#854F0B',
        '#A32D2D', '#3B6D11', '#993556', '#5F5E5A',
    ];

    useEffect(() => {
        if (!canvasRef.current) return;
        const isDark = document.documentElement.classList.contains('dark');

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        chartRef.current = new ChartJS(canvasRef.current, {
            type: 'doughnut',
            data: {
                labels: brackets.map((b) => b.label),
                datasets: [
                    {
                        data: brackets.map((b) => b.count),
                        backgroundColor: COLORS.slice(0, brackets.length),
                        borderWidth: 2,
                        borderColor: isDark ? '#18181b' : '#ffffff',
                        hoverOffset: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#1e2024' : '#fff',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        borderWidth: 1,
                        titleColor: isDark ? '#e8eaed' : '#1a1a1a',
                        bodyColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx: any) => ` ${ctx.parsed.toLocaleString()} residents`,
                        },
                    },
                },
            },
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [brackets]);

    const total = brackets.reduce((s, b) => s + b.count, 0);

    return (
        <div className="flex flex-wrap items-center gap-6">
            <div className="relative size-[180px] shrink-0">
                <canvas ref={canvasRef} role="img" aria-label="Doughnut chart of age bracket distribution">
                    {brackets.map((b) => `${b.label}: ${b.count}`).join(', ')}
                </canvas>
            </div>
            <div className="grid min-w-[160px] flex-1 grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {brackets.map((b, i) => (
                    <div key={b.label} className="flex items-center gap-2">
                        <span
                            className="size-2.5 shrink-0 rounded-sm"
                            style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="min-w-0 flex-1 text-muted-foreground">{b.label}</span>
                        <span className="shrink-0 tabular-nums text-foreground">
                            {total > 0 ? ((b.count / total) * 100).toFixed(0) : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function SectionCard({
    title,
    badge,
    children,
}: {
    title: string;
    badge?: string | number;
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border border-border/80 bg-card p-5 shadow-sm',
                'dark:border-zinc-700/80 dark:bg-zinc-900/90',
            )}
        >
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-medium text-foreground">{title}</h2>
                {badge !== undefined ? (
                    <span className="rounded-full border border-border/80 bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:border-zinc-600 dark:bg-zinc-800">
                        {badge}
                    </span>
                ) : null}
            </div>
            {children}
        </div>
    );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
    return (
        <div
            style={{
                height: 0,
                borderTop: '0.5px solid var(--color-border-tertiary)',
                margin: '0.75rem 0',
            }}
        />
    );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

function firstError(errors: Record<string, string | string[] | undefined> | undefined, key: string): string | undefined {
    const v = errors?.[key];
    if (v == null) {
        return undefined;
    }

    return Array.isArray(v) ? v[0] : v;
}

export default function CensusDashboard({
    barangay_id,
    barangay_name,
    barangays = [],
    metrics,
    dashboard_scope = 'barangay',
}: Props) {
    const { errors } = usePage().props as {
        errors?: Record<string, string | string[]>;
    };
    const barangayChoiceError = firstError(errors, 'barangay_id');

    const isGlobalView = dashboard_scope === 'global';

    const breakdown = useMemo(() => {
        if (!metrics) return { rows: [] as { name: string; count: number }[], title: '' };
        const byBarangay = metrics.by_barangay ?? [];
        if (isGlobalView) return { rows: byBarangay, title: 'Population by barangay' };
        if (byBarangay.length > 0) return { rows: byBarangay, title: 'Population by barangay' };
        return { rows: metrics.by_purok, title: 'Population by purok' };
    }, [metrics, isGlobalView]);

    const maxBreakdown = useMemo(
        () => Math.max(0, ...breakdown.rows.map((p) => p.count)),
        [breakdown.rows],
    );

    const isBarangayChart = breakdown.title === 'Population by barangay';

    const genderTotal =
        (metrics?.gender_distribution.male ?? 0) +
        (metrics?.gender_distribution.female ?? 0) +
        (metrics?.gender_distribution.other ?? 0);

    const contextLabel = isGlobalView
        ? 'All barangays — system-wide totals'
        : barangay_name ?? '';

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Population dashboard" />

            <div className="flex min-w-0 flex-col gap-5">
                {barangayChoiceError ? (
                    <Alert className="border-amber-600/45 bg-amber-500/10 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-50">
                        <AlertCircle className="size-4 text-amber-700 dark:text-amber-400" />
                        <AlertTitle className="text-amber-950 dark:text-amber-50">Choose a barangay</AlertTitle>
                        <AlertDescription className="text-amber-900/90 dark:text-amber-100/90">
                            {barangayChoiceError}
                        </AlertDescription>
                    </Alert>
                ) : null}

                {/* ── Filter (matches mockup: top bar, badge right) ── */}
                {barangays.length > 0 && (
                    <div
                        className={cn(
                            'flex flex-wrap items-center gap-2.5 rounded-xl border border-border/80 bg-card px-4 py-3.5 shadow-sm',
                            'dark:border-zinc-700/80 dark:bg-zinc-900/90',
                        )}
                    >
                        <i className="ti ti-filter text-base text-muted-foreground" aria-hidden="true" />
                        <label htmlFor="barangay_id" className="whitespace-nowrap text-[13px] font-medium text-muted-foreground">
                            Filter by barangay
                        </label>
                        <select
                            id="barangay_id"
                            className={cn(
                                'max-w-[min(100%,340px)] flex-1 cursor-pointer rounded-md border border-border bg-muted px-2.5 py-1.5 text-[13px] text-foreground',
                                'dark:border-zinc-600 dark:bg-zinc-800',
                            )}
                            value={barangay_id ?? ''}
                            onChange={(e) => {
                                const v = e.target.value;
                                router.get(
                                    '/residents/dashboard',
                                    { barangay_id: v ? Number(v) : undefined },
                                    { preserveState: true, preserveScroll: true },
                                );
                            }}
                        >
                            <option value="">All barangays (system-wide)</option>
                            {barangays.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({b.code})
                                </option>
                            ))}
                        </select>

                        {contextLabel ? (
                            <span
                                className={cn(
                                    'ml-auto whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium',
                                    isGlobalView
                                        ? 'border-blue-500/30 bg-blue-500/15 text-blue-300 dark:text-blue-300'
                                        : 'border-border/80 bg-muted text-muted-foreground dark:border-zinc-600 dark:bg-zinc-800',
                                )}
                            >
                                {contextLabel}
                            </span>
                        ) : null}
                    </div>
                )}

                {/* ── Title + quick links ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-lg font-semibold tracking-tight text-foreground">Population dashboard</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Census analytics for the central population database
                        </p>
                    </div>
                    <nav className="flex flex-wrap gap-2" aria-label="Population shortcuts">
                        {[
                            { href: '/residents', label: 'Residents', icon: 'ti-users' },
                            { href: '/residents/households', label: 'Households', icon: 'ti-home' },
                            { href: '/residents/import', label: 'Import', icon: 'ti-upload' },
                        ].map(({ href, label, icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] text-foreground no-underline transition-colors hover:bg-muted/80',
                                    'dark:border-zinc-600 dark:bg-zinc-900/80 dark:hover:bg-zinc-800',
                                )}
                            >
                                <i className={`ti ${icon} text-sm`} aria-hidden="true" />
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* ── No context ── */}
                {!metrics && (
                    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground dark:border-zinc-600">
                        <i className="ti ti-database-off mb-2.5 block text-[28px] opacity-50" aria-hidden="true" />
                        No barangay context available. Select a barangay above or ensure data has been imported.
                    </div>
                )}

                {metrics && (
                    <>
                        {/* ── KPI grid ── */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <KpiCard
                                label="Total residents"
                                value={metrics.total_residents}
                                icon="ti-users"
                                accent="blue"
                                sub={`${metrics.active_residents.toLocaleString()} active`}
                            />
                            <KpiCard
                                label="Households"
                                value={metrics.total_households}
                                icon="ti-home"
                                accent="teal"
                            />
                            <KpiCard
                                label="Registered voters"
                                value={metrics.voters}
                                icon="ti-certificate"
                                accent="purple"
                                sub={`${metrics.total_residents > 0 ? ((metrics.voters / metrics.total_residents) * 100).toFixed(1) : 0}% of population`}
                            />
                            <KpiCard
                                label="PWD"
                                value={metrics.pwd}
                                icon="ti-wheelchair"
                                accent="amber"
                                sub={`${metrics.total_residents > 0 ? ((metrics.pwd / metrics.total_residents) * 100).toFixed(1) : 0}% of population`}
                            />
                        </div>

                        {/* ── Secondary stats row ── */}
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                            {[
                                { label: 'Male', value: metrics.male, icon: 'ti-gender-male' },
                                { label: 'Female', value: metrics.female, icon: 'ti-gender-female' },
                                { label: 'Seniors', value: metrics.seniors, icon: 'ti-walk' },
                                { label: 'Minors', value: metrics.minors, icon: 'ti-baby-carriage' },
                            ].map(({ label, value, icon }) => (
                                <div
                                    key={label}
                                    className={cn(
                                        'flex items-center gap-2.5 rounded-lg border border-transparent bg-muted/80 px-4 py-3.5',
                                        'dark:border-zinc-700/50 dark:bg-zinc-800/80',
                                    )}
                                >
                                    <i className={`ti ${icon} shrink-0 text-base text-muted-foreground`} aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="text-base font-medium tabular-nums text-foreground">{value.toLocaleString()}</p>
                                        <p className="text-[11px] text-muted-foreground">{label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Charts: population | demographics column (mockup) ── */}
                        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2 lg:gap-4">
                            <SectionCard title={breakdown.title} badge={breakdown.rows.length}>
                                {breakdown.rows.length === 0 ? (
                                    <p className="m-0 text-[13px] text-muted-foreground">No data available.</p>
                                ) : isBarangayChart ? (
                                    <BarangayBarChart rows={breakdown.rows} />
                                ) : (
                                    <div className="flex flex-col gap-3.5">
                                        {breakdown.rows.map((p) => (
                                            <HBarRow
                                                key={p.name}
                                                label={p.name}
                                                value={p.count}
                                                max={maxBreakdown}
                                                showPct
                                                total={metrics.total_residents}
                                            />
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            <div className="flex min-w-0 flex-col gap-3">
                                <SectionCard title="Gender distribution">
                                    <div className="flex flex-col gap-3.5">
                                        <HBarRow
                                            label="Male"
                                            value={metrics.gender_distribution.male}
                                            max={genderTotal}
                                            color="#3b82f6"
                                            showPct
                                            total={genderTotal}
                                        />
                                        <HBarRow
                                            label="Female"
                                            value={metrics.gender_distribution.female}
                                            max={genderTotal}
                                            color="#ec4899"
                                            showPct
                                            total={genderTotal}
                                        />
                                        <HBarRow
                                            label="Other / unspecified"
                                            value={metrics.gender_distribution.other}
                                            max={genderTotal}
                                            color="#a1a1aa"
                                            showPct
                                            total={genderTotal}
                                        />
                                    </div>

                                    <Divider />

                                    <div className="flex flex-wrap gap-4">
                                        {[
                                            { label: 'Male', value: metrics.gender_distribution.male, color: '#3b82f6' },
                                            { label: 'Female', value: metrics.gender_distribution.female, color: '#ec4899' },
                                            { label: 'Other', value: metrics.gender_distribution.other, color: '#a1a1aa' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="flex items-center gap-1.5">
                                                <span
                                                    className="size-2 shrink-0 rounded-sm"
                                                    style={{ background: color }}
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {label} —{' '}
                                                    <strong className="font-medium text-foreground">
                                                        {genderTotal > 0 ? ((value / genderTotal) * 100).toFixed(1) : 0}%
                                                    </strong>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </SectionCard>

                                <SectionCard title="Age distribution" badge={`${metrics.age_brackets.length} brackets`}>
                                    <AgeBracketsChart brackets={metrics.age_brackets} />
                                </SectionCard>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
