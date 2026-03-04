import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const STATUS_OPTIONS = ['present', 'absent', 'late', 'excused'];

type Attendance = {
    id: number;
    session_id: number;
    user: { id: number; name: string } | null;
    status: string;
};

type Session = {
    id: number;
    session_date: string;
};

type Props = {
    attendance: Attendance;
    session: Session;
};

export default function AttendancesEdit({
    attendance,
    session,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sessions', href: '/sessions' },
        {
            title: new Date(session.session_date).toLocaleDateString(),
            href: `/sessions/${session.id}`,
        },
        { title: 'Edit Attendance', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Attendance" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-xl font-semibold">Edit Attendance</h1>
                <p className="text-muted-foreground text-sm">
                    {attendance.user?.name ?? 'Member'} — Session{' '}
                    {new Date(session.session_date).toLocaleDateString()}
                </p>
                <Form
                    action={`/attendances/${attendance.id}`}
                    method="put"
                    className="max-w-md space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    required
                                    defaultValue={attendance.status}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    {STATUS_OPTIONS.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.status} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Update'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={`/sessions/${session.id}`}>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
