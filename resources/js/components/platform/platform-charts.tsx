export function HBarRow({
    label,
    value,
    max,
    color = '#7c3aed',
}: {
    label: string;
    value: number;
    max: number;
    color?: string;
}) {
    const pct = max > 0 ? (value / max) * 100 : 0;

    return (
        <div className="min-w-0">
            <div className="mb-1.5 flex justify-between gap-2 text-[13px]">
                <span className="truncate font-normal text-foreground">{label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{value.toLocaleString()}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted dark:bg-zinc-800">
                <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    );
}

export function VerticalBarChart({
    data,
    maxHeight = 96,
}: {
    data: { label: string; count: number }[];
    maxHeight?: number;
}) {
    const max = data.reduce((m, r) => Math.max(m, r.count), 0) || 1;

    return (
        <div className="flex flex-wrap items-end gap-2">
            {data.map((row) => (
                <div key={row.label} className="flex flex-col items-center gap-1">
                    <div
                        className="w-7 rounded-t bg-violet-600/80 dark:bg-violet-500/70"
                        style={{
                            height: `${Math.max(6, (row.count / max) * maxHeight)}px`,
                        }}
                        title={`${row.count}`}
                    />
                    <span className="max-w-[52px] truncate text-[10px] text-muted-foreground">{row.label}</span>
                </div>
            ))}
        </div>
    );
}

export function KpiCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: number;
    sub?: string;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-5 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900/90">
            <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
            <div>
                <p className="text-[28px] font-medium leading-none tracking-tight tabular-nums">{value.toLocaleString()}</p>
                {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
            </div>
        </div>
    );
}

export function StatusDonut({ active, inactive }: { active: number; inactive: number }) {
    const total = active + inactive || 1;
    const activePct = (active / total) * 100;

    return (
        <div className="flex items-center gap-6">
            <div
                className="relative h-24 w-24 rounded-full"
                style={{
                    background: `conic-gradient(#22c55e 0 ${activePct}%, #94a3b8 ${activePct}% 100%)`,
                }}
            >
                <div className="absolute inset-2 flex items-center justify-center rounded-full bg-card text-sm font-semibold">
                    {total}
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Active: {active}
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                    Inactive: {inactive}
                </div>
            </div>
        </div>
    );
}
