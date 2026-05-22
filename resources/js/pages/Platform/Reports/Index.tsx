import { Head, Link, router } from '@inertiajs/react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Platform', href: '/platform/tenants' },
    { title: 'Reports', href: '/platform/reports' },
];

type AuditRow = {
    id: number;
    action: string;
    module: string;
    description: string;
    user_name: string;
    created_at: string | null;
};

type Props = {
    audit_preview: AuditRow[];
    audit_modules: string[];
    filters: { module: string };
};

export default function PlatformReportsIndex({ audit_preview, audit_modules, filters }: Props) {
    const onFilter = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        router.get('/platform/reports', { module: fd.get('module') || '' }, { preserveState: true });
    };

    const auditExportUrl = () => {
        const params = new URLSearchParams();
        if (filters.module) {
            params.set('module', filters.module);
        }
        params.set('days', '30');
        const q = params.toString();
        return `/platform/reports/audit/export${q ? `?${q}` : ''}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Platform Reports" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-semibold">Platform reports</h1>
                    <p className="text-sm text-muted-foreground">Exportable operational data for vendor administration.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-start gap-3">
                            <FileSpreadsheet className="h-8 w-8 text-violet-600" />
                            <div className="flex-1">
                                <h2 className="font-semibold">Tenant directory</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    All municipalities with codes, branding, status, and barangay/user counts.
                                </p>
                                <Button className="mt-4" asChild>
                                    <a href="/platform/reports/tenants/export">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-start gap-3">
                            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                            <div className="flex-1">
                                <h2 className="font-semibold">Audit trail</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Platform activity log for the last 30 days (filterable by module).
                                </p>
                                <Button className="mt-4" variant="outline" asChild>
                                    <a href={auditExportUrl()}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold">Audit log preview</h2>
                            <p className="text-xs text-muted-foreground">Latest entries before export.</p>
                        </div>
                        <form onSubmit={onFilter} className="flex items-end gap-2">
                            <div>
                                <Label htmlFor="module" className="text-xs">
                                    Module
                                </Label>
                                <select
                                    id="module"
                                    name="module"
                                    defaultValue={filters.module}
                                    className="mt-1 flex h-9 min-w-[160px] rounded-md border border-input bg-background px-2 text-sm"
                                >
                                    <option value="">All modules</option>
                                    {audit_modules.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button type="submit" size="sm" variant="secondary">
                                Filter
                            </Button>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2">When</th>
                                    <th className="px-3 py-2">User</th>
                                    <th className="px-3 py-2">Module</th>
                                    <th className="px-3 py-2">Action</th>
                                    <th className="px-3 py-2">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {audit_preview.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                                            No audit entries found.
                                        </td>
                                    </tr>
                                ) : (
                                    audit_preview.map((row) => (
                                        <tr key={row.id} className="border-t">
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                                                {row.created_at ?? '—'}
                                            </td>
                                            <td className="px-3 py-2">{row.user_name}</td>
                                            <td className="px-3 py-2 font-mono text-xs">{row.module}</td>
                                            <td className="px-3 py-2">{row.action}</td>
                                            <td className="max-w-md truncate px-3 py-2">{row.description}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                        More report types (users by tenant, cross-tenant census summary) can be added in a later phase.
                    </p>
                </div>

                <Button variant="link" className="w-fit px-0" asChild>
                    <Link href="/platform/analytics">View full analytics →</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
