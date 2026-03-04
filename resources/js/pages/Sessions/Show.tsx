import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

type Attendance = {
    id: number;
    user_id: number;
    user: { id: number; name: string } | null;
    status: string;
};

type Resolution = {
    id: number;
    title: string;
    resolution_number: string;
    status: string;
};

type Session = {
    id: number;
    session_date: string;
    agenda: string | null;
    minutes_file: string | null;
    created_by: { id: number; name: string } | null;
    attendances: Attendance[];
    resolutions: Resolution[];
};

type Props = {
    session: Session;
    canEdit: boolean;
};

export default function SessionsShow({ session, canEdit }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sessions', href: '/sessions' },
        {
            title: new Date(session.session_date).toLocaleDateString(),
            href: `/sessions/${session.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`Session ${new Date(session.session_date).toLocaleDateString()}`}
            />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {flash?.status && (
                    <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {flash.status}
                    </p>
                )}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Session —{' '}
                            {new Date(
                                session.session_date,
                            ).toLocaleDateString()}
                        </h1>
                        {session.created_by && (
                            <p className="mt-1 text-muted-foreground text-sm">
                                Created by {session.created_by.name}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/sessions/${session.id}/attendance`}>
                                View Attendance
                            </Link>
                        </Button>
                        {canEdit && (
                            <>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/sessions/${session.id}/edit`}>
                                        Edit Session
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {session.agenda && (
                    <section>
                        <h2 className="mb-2 text-sm font-medium">
                            Agenda
                        </h2>
                        <p className="whitespace-pre-wrap rounded-lg border border-sidebar-border/70 bg-muted/30 p-3 text-sm dark:border-sidebar-border">
                            {session.agenda}
                        </p>
                    </section>
                )}

                <section>
                    <h2 className="mb-2 text-sm font-medium">Attendance</h2>
                    <div className="rounded-lg border border-sidebar-border/70 overflow-hidden dark:border-sidebar-border">
                        {session.attendances.length === 0 ? (
                            <p className="p-4 text-muted-foreground text-sm">
                                No attendance recorded.
                            </p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 bg-muted/50 dark:border-sidebar-border">
                                        <th className="p-3 font-medium">
                                            Member
                                        </th>
                                        <th className="p-3 font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {session.attendances.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="border-b border-sidebar-border/70 last:border-b-0 dark:border-sidebar-border"
                                        >
                                            <td className="p-3">
                                                {a.user?.name ?? '—'}
                                            </td>
                                            <td className="p-3 capitalize text-muted-foreground">
                                                {a.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="mb-2 text-sm font-medium">
                        Resolutions
                    </h2>
                    <div className="rounded-lg border border-sidebar-border/70 overflow-hidden dark:border-sidebar-border">
                        {session.resolutions.length === 0 ? (
                            <p className="p-4 text-muted-foreground text-sm">
                                No resolutions for this session.
                            </p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 bg-muted/50 dark:border-sidebar-border">
                                        <th className="p-3 font-medium">#</th>
                                        <th className="p-3 font-medium">
                                            Title
                                        </th>
                                        <th className="p-3 font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {session.resolutions.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="border-b border-sidebar-border/70 last:border-b-0 dark:border-sidebar-border"
                                        >
                                            <td className="p-3 font-medium">
                                                {r.resolution_number}
                                            </td>
                                            <td className="p-3">
                                                {r.title}
                                            </td>
                                            <td className="p-3 capitalize text-muted-foreground">
                                                {r.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
