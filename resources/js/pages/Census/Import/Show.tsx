import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';

type PreviewRow = {
    row: number;
    data: Record<string, unknown>;
};

type Validation = {
    row_errors: Record<string, string[]>;
    duplicate_row_numbers: number[];
    duplicate_with_existing_ids: Record<string, number>;
};

type LogProps = {
    id: number;
    file_name: string;
    status: string;
    total_rows: number;
    successful_imports: number;
    failed_imports: number;
    created_at: string | null;
};

type Props = {
    log: LogProps;
    preview_rows: PreviewRow[];
    validation: Validation | null;
    can_commit: boolean;
};

export default function CensusImportShow({ log, preview_rows, validation, can_commit }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Population', href: '/residents/dashboard' },
        { title: 'Import', href: '/residents/import' },
        { title: log.file_name, href: `/residents/import/${log.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={`Import ${log.file_name}`} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{log.file_name}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Status: <span className="capitalize">{log.status}</span> · Rows: {log.total_rows}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/residents/import">Back</Link>
                        </Button>
                        {log.status !== 'preview' && log.failed_imports > 0 && (
                            <Button variant="outline" asChild>
                                <a href={`/residents/import/${log.id}/errors`}>Download error CSV</a>
                            </Button>
                        )}
                    </div>
                </div>

                {validation && (
                    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                        <h2 className="mb-4 text-lg font-medium">Validation summary</h2>
                        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                            <li>
                                Rows with field errors:{' '}
                                <span className="font-medium text-foreground">
                                    {Object.keys(validation.row_errors).length}
                                </span>
                            </li>
                            <li>
                                Duplicate rows within file:{' '}
                                <span className="font-medium text-foreground">
                                    {validation.duplicate_row_numbers.length}
                                </span>
                            </li>
                            <li>
                                Rows matching existing residents:{' '}
                                <span className="font-medium text-foreground">
                                    {Object.keys(validation.duplicate_with_existing_ids).length}
                                </span>
                            </li>
                        </ul>
                    </div>
                )}

                <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <h2 className="border-b px-6 py-4 text-lg font-medium">Preview (first 50 rows)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-xs">
                            <thead className="border-b bg-slate-50/80 dark:bg-slate-900/40">
                                <tr>
                                    <th className="px-4 py-2">#</th>
                                    <th className="px-4 py-2">First</th>
                                    <th className="px-4 py-2">Last</th>
                                    <th className="px-4 py-2">Birth date</th>
                                    <th className="px-4 py-2">Purok</th>
                                    <th className="px-4 py-2">HH code</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {preview_rows.map((pr) => (
                                    <tr key={pr.row}>
                                        <td className="px-4 py-2 tabular-nums">{pr.row}</td>
                                        <td className="px-4 py-2">{String(pr.data.first_name ?? '')}</td>
                                        <td className="px-4 py-2">{String(pr.data.last_name ?? '')}</td>
                                        <td className="px-4 py-2">{String(pr.data.birth_date ?? '')}</td>
                                        <td className="px-4 py-2">{String(pr.data.purok ?? '')}</td>
                                        <td className="px-4 py-2">{String(pr.data.household_code ?? '')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {can_commit && (
                    <Form
                        action={`/residents/import/${log.id}/commit`}
                        method="post"
                        className="rounded-xl border border-primary/30 bg-primary/5 p-6"
                    >
                        {({ processing }) => (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Commit saves all rows that pass validation. Failed rows are logged without
                                    stopping the run.
                                </p>
                                <Button type="submit" disabled={processing}>
                                    Commit import
                                </Button>
                            </div>
                        )}
                    </Form>
                )}
            </div>
        </AppLayout>
    );
}
