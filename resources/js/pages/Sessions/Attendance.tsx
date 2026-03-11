import { useState } from 'react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    AlertCircle, 
    ChevronLeft,
    User,
    Edit3,
    Save,
    MessageSquare,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
    { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: 'late', label: 'Late', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'excused', label: 'Excused', icon: AlertCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
] as const;

type AttendanceRow = {
    id: number;
    user_id: number;
    user: { id: number; name: string } | null;
    status: string;
    reason: string | null;
    remarks?: string | null;
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
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{ status: string; reason: string }>({
        status: '',
        reason: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sessions', href: '/sessions' },
        {
            title: new Date(session.session_date).toLocaleDateString(),
            href: `/sessions/${session.id}`,
        },
        { title: 'Attendance', href: '#' },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusConfig = (status: string) => {
        return STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
    };

    const startEditing = (attendance: AttendanceRow) => {
        setEditingId(attendance.id);
        setEditForm({
            status: attendance.status,
            reason: attendance.reason || '',
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ status: '', reason: '' });
    };

    // Calculate attendance summary
    const summary = {
        total: attendances.length,
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        late: attendances.filter(a => a.status === 'late').length,
        excused: attendances.filter(a => a.status === 'excused').length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Attendance — ${new Date(session.session_date).toLocaleDateString()}`} />
            
            <div className="flex-1 space-y-6 p-6 md:p-8">
                {/* Flash Message */}
                {flash?.status && (
                    <div className="animate-in slide-in-from-top-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-200">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            {flash.status}
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link href={`/sessions/${session.id}`}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Session Attendance</span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight mt-1">
                                {formatDate(session.session_date)}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Attendance Summary Cards */}
                {attendances.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border bg-card p-4">
                            <p className="text-sm text-muted-foreground">Total Members</p>
                            <p className="mt-1 text-2xl font-semibold">{summary.total}</p>
                        </div>
                        <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-900/30">
                            <p className="text-sm text-green-700 dark:text-green-300">Present</p>
                            <p className="mt-1 text-2xl font-semibold text-green-700 dark:text-green-300">
                                {summary.present}
                            </p>
                        </div>
                        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/30">
                            <p className="text-sm text-red-700 dark:text-red-300">Absent</p>
                            <p className="mt-1 text-2xl font-semibold text-red-700 dark:text-red-300">
                                {summary.absent}
                            </p>
                        </div>
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4 dark:border-yellow-900/30">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">Late/Excused</p>
                            <p className="mt-1 text-2xl font-semibold text-yellow-700 dark:text-yellow-300">
                                {summary.late + summary.excused}
                            </p>
                        </div>
                    </div>
                )}

                {/* Attendance List */}
                <div className="rounded-lg border bg-card">
                    <div className="border-b bg-muted/50 px-6 py-4">
                        <h2 className="text-lg font-medium flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            Member Attendance
                        </h2>
                    </div>

                    {attendances.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div className="rounded-full bg-muted p-4">
                                <User className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">No attendance records</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                There are no attendance records for this session yet.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {attendances.map((attendance) => {
                                const statusConfig = getStatusConfig(attendance.status);
                                const StatusIcon = statusConfig.icon;
                                const isEditing = editingId === attendance.id;

                                return (
                                    <div key={attendance.id} className="p-4 hover:bg-muted/30 transition-colors">
                                        {isEditing ? (
                                            // Edit Mode
                                            <Form
                                                action={`/attendance/${attendance.id}`}
                                                method="post"
                                                className="space-y-3"
                                                onSuccess={() => cancelEditing()}
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <label className="text-sm font-medium mb-1 block">
                                                                Attendance Status
                                                            </label>
                                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                                {STATUS_OPTIONS.map((opt) => {
                                                                    const Icon = opt.icon;
                                                                    return (
                                                                        <label
                                                                            key={opt.value}
                                                                            className={cn(
                                                                                "flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all",
                                                                                editForm.status === opt.value
                                                                                    ? `${opt.bgColor} border-${opt.value === 'present' ? 'green' : opt.value === 'absent' ? 'red' : opt.value === 'late' ? 'yellow' : 'blue'}-200`
                                                                                    : "hover:bg-muted"
                                                                            )}
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                name="status"
                                                                                value={opt.value}
                                                                                checked={editForm.status === opt.value}
                                                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                                                className="sr-only"
                                                                            />
                                                                            <Icon className={cn("h-4 w-4", opt.color)} />
                                                                            <span className="text-sm">{opt.label}</span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="text-sm font-medium mb-1 block">
                                                                Reason (optional)
                                                            </label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    name="reason"
                                                                    value={editForm.reason}
                                                                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                                                                    placeholder="e.g., Official business, Sick leave..."
                                                                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex gap-2 sm:self-end">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={cancelEditing}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" size="sm" className="gap-2">
                                                            <Save className="h-4 w-4" />
                                                            Save Changes
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Form>
                                        ) : (
                                            // View Mode
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "flex h-10 w-10 items-center justify-center rounded-full",
                                                            statusConfig.bgColor
                                                        )}>
                                                            <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {attendance.user?.name ?? 'Unknown Member'}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className={cn(
                                                                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                                                    statusConfig.bgColor,
                                                                    statusConfig.color
                                                                )}>
                                                                    {statusConfig.label}
                                                                </span>
                                                                {attendance.reason && (
                                                                    <>
                                                                        <span className="text-xs text-muted-foreground">•</span>
                                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                            <MessageSquare className="h-3 w-3" />
                                                                            {attendance.reason}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {canUpdate && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEditing(attendance)}
                                                        className="gap-2"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                        Update
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Help Section for Non-Tech Users */}
                <div className="rounded-lg border bg-muted/30 p-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Quick Guide
                    </h3>
                    <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                        <li>• <span className="font-medium text-green-600">Present</span> - Member attended the session</li>
                        <li>• <span className="font-medium text-red-600">Absent</span> - Member did not attend</li>
                        <li>• <span className="font-medium text-yellow-600">Late</span> - Member arrived after session started</li>
                        <li>• <span className="font-medium text-blue-600">Excused</span> - Member was excused from attending</li>
                        <li>• Click the "Update" button next to any member to change their attendance status</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}