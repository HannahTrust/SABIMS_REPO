import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Calendar,
    Users,
    FileText,
    QrCode,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Edit3,
    ChevronLeft,
    UserPlus,
    Download,
    Copy,
    Check,
    Eye,
    User,
    BookOpen,
    Smartphone,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const STATUS_OPTIONS = [
    { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { value: 'late', label: 'Late', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { value: 'excused', label: 'Excused', icon: AlertCircle, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
] as const;

type Attendance = {
    id: number;
    user_id: number;
    user: { id: number; name: string } | null;
    status: string;
    reason: string | null;
    time_scanned?: string | null;
};

type Resolution = {
    id: number;
    title: string;
    resolution_number: string;
    status: string;
};

type Session = {
    id: number;
    session_title: string | null;
    session_date: string;
    committee: { id: number; name: string } | null;
    attendance_status: string;
    scan_url: string | null;
    agenda: string | null;
    minutes_type: 'upload' | 'text';
    minutes_file: string | null;
    minutes_file_url: string | null;
    minutes_content: string | null;
    created_by: { id: number; name: string } | null;
    attendances: Attendance[];
    total_expected?: number;
    present_count?: number;
    absent_count?: number;
    resolutions: Resolution[];
};

type Props = {
    session: Session;
    canEdit: boolean;
    showQrCode?: boolean;
    isAssignedToSession?: boolean;
};

function formatStatusWithReason(status: string, reason: string | null): string {
    if (reason?.trim()) {
        return `${status.charAt(0).toUpperCase() + status.slice(1)} (${reason})`;
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function SessionsShow({
    session,
    canEdit,
    showQrCode = false,
    isAssignedToSession = false,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [activeTab, setActiveTab] = useState('overview');
    const [qrCopied, setQrCopied] = useState(false);
    const [showQrFull, setShowQrFull] = useState(false);

    const totalMembers = session.total_expected ?? session.attendances.length;
    const presentCount = session.present_count ??
        session.attendances.filter((a) => a.status === 'present').length;
    const absentCount = session.absent_count ??
        session.attendances.filter((a) => a.status === 'absent').length;
    const lateCount = session.attendances.filter((a) => a.status === 'late').length;
    const hasQuorum = totalMembers > 0 && presentCount > Math.floor(totalMembers / 2);
    const isAttendanceOpen = session.attendance_status === 'open';
    const attendancePercentage = totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0;

    const handleOpenAttendance = () => {
        router.post(
            `/sessions/${session.id}/attendance/open`,
            {},
            { preserveScroll: true },
        );
    };
    
    const handleCloseAttendance = () => {
        router.post(
            `/sessions/${session.id}/attendance/close`,
            {},
            { preserveScroll: true },
        );
    };

    const copyQrUrl = () => {
        if (session.scan_url) {
            navigator.clipboard.writeText(session.scan_url);
            setQrCopied(true);
            setTimeout(() => setQrCopied(false), 2000);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sessions', href: '/sessions' },
        {
            title: session.session_title ||
                new Date(session.session_date).toLocaleDateString(),
            href: `/sessions/${session.id}`,
        },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status: string) => {
        const config = STATUS_OPTIONS.find(opt => opt.value === status);
        if (!config) return null;
        const Icon = config.icon;
        return <Icon className={cn("h-4 w-4", config.color)} />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={`Session — ${new Date(session.session_date).toLocaleDateString()}`} />
            
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

                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/sessions">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Session Details</span>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight mt-1">
                            {session.session_title || 'Untitled Session'}
                        </h1>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {canEdit && (
                            <>
                                {isAttendanceOpen ? (
                                    <Button
                                        variant="outline"
                                        onClick={handleCloseAttendance}
                                        className="gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Close Attendance
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleOpenAttendance}
                                        className="gap-2"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Open Attendance
                                    </Button>
                                )}
                            </>
                        )}
                        <Button asChild variant="outline" className="gap-2">
                            <Link href={`/sessions/${session.id}/attendance`}>
                                <Users className="h-4 w-4" />
                                Manage Attendance
                            </Link>
                        </Button>
                        {canEdit && (
                            <Button asChild variant="outline" size="icon">
                                <Link href={`/sessions/${session.id}/edit`}>
                                    <Edit3 className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Session Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.session_date)}
                    </Badge>
                    {session.committee && (
                        <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {session.committee.name}
                        </Badge>
                    )}
                    <Badge 
                        variant="outline"
                        className={cn(
                            "gap-1",
                            isAttendanceOpen 
                                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300"
                                : ""
                        )}
                    >
                        <div className={cn(
                            "h-2 w-2 rounded-full",
                            isAttendanceOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"
                        )} />
                        Attendance {isAttendanceOpen ? 'Open' : 'Closed'}
                    </Badge>
                    {session.created_by && (
                        <span className="text-muted-foreground">
                            Created by {session.created_by.name}
                        </span>
                    )}
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="overview" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="attendance" className="gap-2">
                            <Users className="h-4 w-4" />
                            Attendance
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Documents
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        {/* QR Code Section for Members */}
                        {isAssignedToSession && (
                            <div className="rounded-lg border bg-card overflow-hidden">
                                <div className="border-b bg-muted/50 px-6 py-4">
                                    <h2 className="text-lg font-medium flex items-center gap-2">
                                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                                        Mark Your Attendance
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {showQrCode && session.scan_url ? (
                                        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
                                            <div className="relative group">
                                                <div 
                                                    className="inline-flex rounded-xl border-2 bg-white p-4 cursor-pointer transition-all hover:shadow-lg"
                                                    onClick={() => setShowQrFull(true)}
                                                >
                                                    <QRCodeSVG
                                                        value={session.scan_url}
                                                        size={160}
                                                        level="M"
                                                        includeMargin
                                                    />
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                                                    onClick={copyQrUrl}
                                                >
                                                    {qrCopied ? 
                                                        <Check className="h-4 w-4 text-green-600" /> : 
                                                        <Copy className="h-4 w-4" />
                                                    }
                                                </Button>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <h3 className="font-semibold">Scan to Mark Present</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Open your phone's camera and scan this QR code to mark your attendance for this session.
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="gap-2" onClick={copyQrUrl}>
                                                        <Copy className="h-4 w-4" />
                                                        Copy Link
                                                    </Button>
                                                    <Button size="sm" className="gap-2" onClick={() => setShowQrFull(true)}>
                                                        <QrCode className="h-4 w-4" />
                                                        View Full QR
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-full bg-muted p-3">
                                                <Clock className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Attendance is currently closed</p>
                                                <p className="text-sm text-muted-foreground">
                                                    The session secretary will open attendance when the session begins.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Agenda Section */}
                        {session.agenda && (
                            <div className="rounded-lg border bg-card">
                                <div className="border-b bg-muted/50 px-6 py-4">
                                    <h2 className="text-lg font-medium flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                                        Agenda
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="prose prose-sm max-w-none">
                                        <p className="whitespace-pre-wrap text-sm">
                                            {session.agenda}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attendance Dashboard */}
                        <div className="rounded-lg border bg-card">
                            <div className="border-b bg-muted/50 px-6 py-4">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    Attendance Dashboard
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Stats Cards */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-lg border p-3">
                                                <p className="text-xs text-muted-foreground">Total Members</p>
                                                <p className="text-2xl font-semibold">{totalMembers}</p>
                                            </div>
                                            <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                                                <p className="text-xs text-green-600">Present</p>
                                                <p className="text-2xl font-semibold text-green-600">{presentCount}</p>
                                            </div>
                                            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                                                <p className="text-xs text-red-600">Absent</p>
                                                <p className="text-2xl font-semibold text-red-600">{absentCount}</p>
                                            </div>
                                            <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-3">
                                                <p className="text-xs text-yellow-600">Late</p>
                                                <p className="text-2xl font-semibold text-yellow-600">{lateCount}</p>
                                            </div>
                                        </div>

                                        {/* Quorum Status */}
                                        <div className="rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Attendance Rate</span>
                                                <span className="text-sm text-muted-foreground">{attendancePercentage}%</span>
                                            </div>
                                            <Progress value={attendancePercentage} className="mt-2 h-2" />
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    hasQuorum ? "bg-green-500" : "bg-amber-500"
                                                )} />
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    hasQuorum ? "text-green-600" : "text-amber-600"
                                                )}>
                                                    {hasQuorum ? "✓ Quorum Achieved" : "⚠ Quorum Not Achieved"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="rounded-lg border">
                                        <div className="border-b bg-muted/30 px-4 py-2">
                                            <h3 className="text-sm font-medium">Recent Check-ins</h3>
                                        </div>
                                        <div className="divide-y max-h-[200px] overflow-auto">
                                            {session.attendances
                                                .filter(a => a.time_scanned)
                                                .slice(0, 5)
                                                .map(a => (
                                                    <div key={a.id} className="flex items-center justify-between p-3">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{a.user?.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(a.status)}
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(a.time_scanned!).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            {session.attendances.filter(a => a.time_scanned).length === 0 && (
                                                <p className="p-4 text-sm text-muted-foreground text-center">
                                                    No check-ins yet
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Attendance Tab */}
                    <TabsContent value="attendance" className="space-y-4">
                        <div className="rounded-lg border bg-card">
                            <div className="border-b bg-muted/50 px-6 py-4">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    Attendance Records
                                </h2>
                            </div>
                            <div className="p-6">
                                {session.attendances.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Users className="h-12 w-12 text-muted-foreground/50" />
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            No attendance records yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {session.attendances.map((a) => {
                                            const statusConfig = STATUS_OPTIONS.find(opt => opt.value === a.status);
                                            const StatusIcon = statusConfig?.icon;
                                            
                                            return (
                                                <div
                                                    key={a.id}
                                                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "flex h-10 w-10 items-center justify-center rounded-full",
                                                            statusConfig?.bgColor
                                                        )}>
                                                            {StatusIcon && (
                                                                <StatusIcon className={cn("h-5 w-5", statusConfig?.color)} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{a.user?.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge 
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "gap-1",
                                                                        statusConfig?.borderColor
                                                                    )}
                                                                >
                                                                    {StatusIcon && (
                                                                        <StatusIcon className={cn("h-3 w-3", statusConfig?.color)} />
                                                                    )}
                                                                    {formatStatusWithReason(a.status, a.reason)}
                                                                </Badge>
                                                                {a.time_scanned && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Scanned at {new Date(a.time_scanned).toLocaleTimeString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-4">
                        {/* Minutes Section */}
                        {(session.minutes_type === 'upload' && session.minutes_file_url) ||
                         (session.minutes_type === 'text' && session.minutes_content) ? (
                            <div className="rounded-lg border bg-card">
                                <div className="border-b bg-muted/50 px-6 py-4">
                                    <h2 className="text-lg font-medium flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        Minutes of the Meeting
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {session.minutes_type === 'upload' && session.minutes_file_url ? (
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-8 w-8 text-primary" />
                                                <div>
                                                    <p className="font-medium">Minutes Document</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Click to download or view
                                                    </p>
                                                </div>
                                            </div>
                                            <Button asChild variant="outline" className="gap-2">
                                                <a
                                                    href={session.minutes_file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm max-w-none">
                                            <p className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
                                                {session.minutes_content}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        {/* Resolutions Section */}
                        <div className="rounded-lg border bg-card">
                            <div className="border-b bg-muted/50 px-6 py-4">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    Resolutions
                                </h2>
                            </div>
                            <div className="p-6">
                                {session.resolutions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            No resolutions for this session
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {session.resolutions.map((r) => (
                                            <div
                                                key={r.id}
                                                className="flex items-center justify-between rounded-lg border p-4"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm text-muted-foreground">
                                                            #{r.resolution_number}
                                                        </span>
                                                        <Badge variant="outline">{r.status}</Badge>
                                                    </div>
                                                    <p className="mt-1 font-medium">{r.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Full QR Code Modal */}
            <Dialog open={showQrFull} onOpenChange={setShowQrFull}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                        <DialogDescription>
                            Use your phone&apos;s camera to scan this QR code and mark your attendance
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4 py-4">
                        <div className="rounded-xl border-2 bg-white p-6">
                            {session.scan_url && (
                                <QRCodeSVG
                                    value={session.scan_url}
                                    size={250}
                                    level="M"
                                    includeMargin
                                />
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2" onClick={copyQrUrl}>
                                {qrCopied ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy Link
                                    </>
                                )}
                            </Button>
                            <Button asChild variant="outline" className="gap-2">
                                <a href={session.scan_url || '#'} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4" />
                                    Open Link
                                </a>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}