import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AttendanceController from '@/actions/App/Http/Controllers/AttendanceController';

const STATUS_OPTIONS = [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'excused', label: 'Excused' },
] as const;

type Attendance = {
    id: number;
    user_id: number;
    user: { id: number; name: string } | null;
    status: string;
    reason: string | null;
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

function formatStatusWithReason(status: string, reason: string | null): string {
    if (reason?.trim()) {
        return `${status.charAt(0).toUpperCase() + status.slice(1)} (${reason})`;
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function SessionsShow({ session, canEdit }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [selectedAttendance, setSelectedAttendance] =
        useState<Attendance | null>(null);
    const [modalStatus, setModalStatus] = useState('');
    const [modalReason, setModalReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const openModal = (a: Attendance) => {
        setSelectedAttendance(a);
        setModalStatus(a.status);
        setModalReason(a.reason ?? '');
    };

    const closeModal = () => setSelectedAttendance(null);

    const handleSaveAttendance = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAttendance) return;
        setSubmitting(true);
        router.post(
            AttendanceController.update.url({ attendance: selectedAttendance.id }),
            { status: modalStatus, reason: modalReason || null },
            {
                onFinish: () => setSubmitting(false),
                onSuccess: () => closeModal(),
            },
        );
    };

    const totalMembers = session.attendances.length;
    const presentCount = session.attendances.filter(
        (a) => a.status === 'present',
    ).length;
    const hasQuorum =
        totalMembers > 0 && presentCount > Math.floor(totalMembers / 2);

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
                    {totalMembers > 0 && (
                        <p className="mb-2 text-muted-foreground text-sm">
                            Members Present: {presentCount} / {totalMembers}
                            {' · '}
                            <span
                                className={
                                    hasQuorum
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-amber-600 dark:text-amber-400'
                                }
                            >
                                {hasQuorum
                                    ? 'Quorum Achieved'
                                    : 'Quorum Not Achieved'}
                            </span>
                        </p>
                    )}
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
                                        {canEdit && (
                                            <th className="p-3 font-medium">
                                                Action
                                            </th>
                                        )}
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
                                                {formatStatusWithReason(
                                                    a.status,
                                                    a.reason,
                                                )}
                                            </td>
                                            {canEdit && (
                                                <td className="p-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openModal(a)
                                                        }
                                                    >
                                                        Update
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                <Dialog
                    open={selectedAttendance !== null}
                    onOpenChange={(open) => !open && closeModal()}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Mark Attendance</DialogTitle>
                        </DialogHeader>
                        {selectedAttendance && (
                            <>
                                <p className="text-muted-foreground text-sm">
                                    Member: {selectedAttendance.user?.name ?? '—'}
                                </p>
                                <form
                                    id="attendance-modal-form"
                                    onSubmit={handleSaveAttendance}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="modal-status">
                                            Status
                                        </Label>
                                        <select
                                            id="modal-status"
                                            value={modalStatus}
                                            onChange={(e) =>
                                                setModalStatus(e.target.value)
                                            }
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="modal-reason">
                                            Reason (optional)
                                        </Label>
                                        <input
                                            id="modal-reason"
                                            type="text"
                                            value={modalReason}
                                            onChange={(e) =>
                                                setModalReason(e.target.value)
                                            }
                                            placeholder="e.g. sick leave, official travel"
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                    </div>
                                </form>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        form="attendance-modal-form"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Saving…' : 'Save'}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

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
