import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sessions', href: '/sessions' },
];

type Session = {
    id: number;
    session_date: string;
    agenda: string | null;
    minutes_file: string | null;
    created_by: { id: number; name: string } | null;
};

type Props = {
    sessions: Session[];
    canCreate: boolean;
};

export default function SessionsIndex({ sessions, canCreate }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sessions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash?.status && (
                    <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {flash.status}
                    </p>
                )}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-semibold">Sessions</h1>
                    {canCreate && (
                        <Button asChild>
                            <Link href="/sessions/create">Create Session</Link>
                        </Button>
                    )}
                </div>
                <div className="rounded-lg border border-sidebar-border/70 overflow-hidden dark:border-sidebar-border">
                    {sessions.length === 0 ? (
                        <p className="p-6 text-muted-foreground text-sm">
                            No sessions yet.
                        </p>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border/70 bg-muted/50 dark:border-sidebar-border">
                                    <th className="p-3 font-medium">Date</th>
                                    <th className="p-3 font-medium">Created by</th>
                                    <th className="p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr
                                        key={session.id}
                                        className="border-b border-sidebar-border/70 last:border-b-0 dark:border-sidebar-border"
                                    >
                                        <td className="p-3">
                                            {new Date(
                                                session.session_date,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {session.created_by?.name ?? '—'}
                                        </td>
                                        <td className="p-3">
                                            <Link
                                                href={`/sessions/${session.id}`}
                                                className="text-primary underline underline-offset-2 hover:no-underline"
                                            >
                                                View
                                            </Link>
                                        </td>
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
