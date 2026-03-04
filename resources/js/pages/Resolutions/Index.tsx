import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Resolutions', href: '/resolutions' },
];

type Resolution = {
    id: number;
    resolution_number: string;
    title: string;
    description: string | null;
    status: string;
    year: number;
    session: { id: number; session_date: string } | null;
    committee: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
};

type Props = {
    resolutions: Resolution[];
    canCreate: boolean;
};

export default function ResolutionsIndex({
    resolutions,
    canCreate,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resolutions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash?.status && (
                    <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {flash.status}
                    </p>
                )}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-semibold">Resolutions</h1>
                    {canCreate && (
                        <Button asChild>
                            <Link href="/resolutions/create">
                                Create Resolution
                            </Link>
                        </Button>
                    )}
                </div>
                <div className="rounded-lg border border-sidebar-border/70 overflow-hidden dark:border-sidebar-border">
                    {resolutions.length === 0 ? (
                        <p className="p-6 text-muted-foreground text-sm">
                            No resolutions yet.
                        </p>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border/70 bg-muted/50 dark:border-sidebar-border">
                                    <th className="p-3 font-medium">Number</th>
                                    <th className="p-3 font-medium">Title</th>
                                    <th className="p-3 font-medium">Committee</th>
                                    <th className="p-3 font-medium">Year</th>
                                    <th className="p-3 font-medium">Status</th>
                                    {canCreate && (
                                        <th className="p-3 font-medium">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {resolutions.map((r) => (
                                    <tr
                                        key={r.id}
                                        className="border-b border-sidebar-border/70 last:border-b-0 dark:border-sidebar-border"
                                    >
                                        <td className="p-3 font-medium">
                                            {r.resolution_number}
                                        </td>
                                        <td className="p-3">{r.title}</td>
                                        <td className="p-3 text-muted-foreground">
                                            {r.committee?.name ?? '—'}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {r.year}
                                        </td>
                                        <td className="p-3 capitalize text-muted-foreground">
                                            {r.status}
                                        </td>
                                        {canCreate && (
                                            <td className="p-3">
                                                <Link
                                                    href={`/resolutions/${r.id}/edit`}
                                                    className="text-primary underline underline-offset-2 hover:no-underline"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
