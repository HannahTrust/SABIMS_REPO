import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar, Users, User, Plus, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sessions', href: '/sessions' },
];

type Session = {
    id: number;
    session_title: string | null;
    session_date: string;
    committee: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
};

type Props = {
    sessions: Session[];
    canCreate: boolean;
};

export default function SessionsIndex({ sessions, canCreate }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const isUpcoming = (dateString: string) => {
        return new Date(dateString) > new Date();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sessions" />
            
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

                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and monitor all parliamentary sessions
                        </p>
                    </div>
                    {canCreate && (
                        <Button asChild className="gap-2">
                            <Link href="/sessions/create">
                                <Plus className="h-4 w-4" />
                                New Session
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats Overview (Optional - adds visual interest) */}
                {sessions.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Total Sessions
                            </div>
                            <p className="mt-2 text-2xl font-semibold">{sessions.length}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Upcoming
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {sessions.filter(s => isUpcoming(s.session_date)).length}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                Committees
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {new Set(sessions.map(s => s.committee?.id)).size}
                            </p>
                        </div>
                    </div>
                )}

                {/* Sessions Grid/Card View */}
                {sessions.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
                        <Calendar className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No sessions yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Get started by creating your first session
                        </p>
                        {canCreate && (
                            <Button asChild className="mt-4">
                                <Link href="/sessions/create">Create Session</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sessions.map((session) => {
                            const upcoming = isUpcoming(session.session_date);
                            
                            return (
                                <Link
                                    key={session.id}
                                    href={`/sessions/${session.id}`}
                                    className="group relative rounded-lg border bg-card transition-all hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/40"
                                >
                                    <div className="p-5">
                                        {/* Status Indicator */}
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                                upcoming 
                                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                                    : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                            )}>
                                                {upcoming ? 'Upcoming' : 'Past'}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="mt-3 text-lg font-semibold leading-tight">
                                            {session.session_title ?? 'Untitled Session'}
                                        </h3>
                                        
                                        {/* Date */}
                                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(session.session_date)}</span>
                                        </div>

                                        {/* Committee */}
                                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{session.committee?.name ?? 'All SB Members'}</span>
                                        </div>

                                        {/* Created By */}
                                        {session.created_by && (
                                            <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                <span>Created by {session.created_by.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Effect Overlay */}
                                    <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-gray-900/5 group-hover:ring-primary/20 dark:ring-white/10" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}