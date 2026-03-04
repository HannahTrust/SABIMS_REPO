import { Form, Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import AttendanceController from '@/actions/App/Http/Controllers/AttendanceController';

const STATUS_OPTIONS = [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'excused', label: 'Excused' },
] as const;

type AttendanceRow = {
    id: number;
    user_id: number;
    user: { id: number; name: string } | null;
    status: string;
    remarks: string | null;
};

type Session = {
    id: number;
    session_date: string;
};

type Props = {
    session: Session;
    attendances: AttendanceRow[];
    canUpdate: boolean;
};

export default function SessionsAttendance({
    session,
    attendances,
    canUpdate,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sessions', href: '/sessions' },
        {
            title: new Date(session.session_date).toLocaleDateString(),
            href: `/sessions/${session.id}`,
        },
        { title: 'Attendance', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`Attendance — ${new Date(session.session_date).toLocaleDateString()}`}
            />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {flash?.status && (
                    <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {flash.status}
                    </p>
                )}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-semibold">
                        Attendance —{' '}
                        {new Date(session.session_date).toLocaleDateString()}
                    </h1>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/sessions/${session.id}`}>
                            Back to Session
                        </Link>
                    </Button>
                </div>
                <div className="rounded-lg border border-sidebar-border/70 overflow-hidden dark:border-sidebar-border">
                    {attendances.length === 0 ? (
                        <p className="p-4 text-muted-foreground text-sm">
                            No attendance records for this session.
                        </p>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border/70 bg-muted/50 dark:border-sidebar-border">
                                    <th className="p-3 font-medium">Member</th>
                                    <th className="p-3 font-medium">Status</th>
                                    <th className="p-3 font-medium">Remarks</th>
                                    {canUpdate && (
                                        <th className="p-3 font-medium">
                                            Action
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {attendances.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-b border-sidebar-border/70 last:border-b-0 dark:border-sidebar-border"
                                    >
                                        <td className="p-3">
                                            {a.user?.name ?? '—'}
                                        </td>
                                        {canUpdate ? (
                                            <td className="p-3" colSpan={3}>
                                                <Form
                                                    action={AttendanceController.update.url({
                                                        attendance: a.id,
                                                    })}
                                                    method="post"
                                                >
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <select
                                                            name="status"
                                                            defaultValue={a.status}
                                                            className="flex h-9 min-w-[120px] rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                        >
                                                            {STATUS_OPTIONS.map((opt) => (
                                                                <option
                                                                    key={opt.value}
                                                                    value={opt.value}
                                                                >
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            name="remarks"
                                                            defaultValue={a.remarks ?? ''}
                                                            placeholder="Optional"
                                                            className="flex h-9 max-w-[200px] rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                        />
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            variant="secondary"
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                </Form>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="p-3 capitalize text-muted-foreground">
                                                    {a.status}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {a.remarks ?? '—'}
                                                </td>
                                                <td className="p-3" />
                                            </>
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
