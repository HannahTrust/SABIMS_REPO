import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type BarangayOpt = { id: number; name: string; code: string };

type LogRow = {
    id: number;
    file_name: string;
    status: string;
    total_rows: number;
    successful_imports: number;
    failed_imports: number;
    created_at: string | null;
    uploaded_by: string | null;
};

type Props = {
    barangay_id?: number | null;
    barangays?: BarangayOpt[];
    logs: LogRow[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Population', href: '/residents/dashboard' },
    { title: 'Census import', href: '/residents/import' },
];

export default function CensusImportIndex({ barangay_id, barangays = [], logs }: Props) {
    const page = usePage();
    const { flash } = page.props as { flash?: { status?: string } };
    const querySuffix = page.url.includes('?') ? page.url.slice(page.url.indexOf('?')) : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Census import" />

            <div className="flex flex-col gap-8">
                {flash?.status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200">
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Census import</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Upload CSV or Excel, preview validation, then commit valid rows.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/residents/dashboard">Dashboard</Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <h2 className="mb-4 text-lg font-medium">Upload file</h2>
                    <Form
                        action="/residents/import"
                        method="post"
                        encType="multipart/form-data"
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {barangays.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="barangay_id">Barangay</Label>
                                        <select
                                            id="barangay_id"
                                            name="barangay_id"
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            defaultValue={barangay_id ?? ''}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                router.get(
                                                    '/residents/import',
                                                    { barangay_id: v ? Number(v) : undefined },
                                                    { preserveState: true },
                                                );
                                            }}
                                        >
                                            <option value="">Select barangay…</option>
                                            {barangays.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.name} ({b.code})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.barangay_id && (
                                            <p className="text-sm text-destructive">{errors.barangay_id}</p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="file">CSV or Excel (.csv, .xlsx)</Label>
                                    <input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        required
                                        className="block w-full text-sm"
                                    />
                                    {errors.file && (
                                        <p className="text-sm text-destructive">{errors.file}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Upload & preview
                                </Button>
                            </>
                        )}
                    </Form>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <h2 className="border-b px-6 py-4 text-lg font-medium">Recent imports</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="border-b bg-slate-50/80 text-xs uppercase text-muted-foreground dark:bg-slate-900/40">
                                <tr>
                                    <th className="px-6 py-3">File</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Rows</th>
                                    <th className="px-6 py-3">OK / Failed</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No imports yet.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-3">{log.file_name}</td>
                                            <td className="px-6 py-3 capitalize">{log.status}</td>
                                            <td className="px-6 py-3 tabular-nums">{log.total_rows}</td>
                                            <td className="px-6 py-3 tabular-nums">
                                                {log.successful_imports} / {log.failed_imports}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link
                                                        href={`/residents/import/${log.id}${querySuffix}`}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
