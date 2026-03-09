import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

type Props = {
    success: boolean;
    message: string;
    session_title?: string;
    already_recorded?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sessions', href: '/sessions' },
    { title: 'Scan Result', href: '#' },
];

export default function AttendanceScanResult({
    success,
    message,
    session_title,
    already_recorded,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Scan" />
            <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 rounded-xl p-6 text-center">
                <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${success ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
                >
                    {success ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    )}
                </div>
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">
                        {success
                            ? already_recorded
                                ? 'Already Recorded'
                                : 'Attendance Recorded'
                            : 'Unable to Record'}
                    </h1>
                    <p className="max-w-sm text-muted-foreground">{message}</p>
                    {session_title && (
                        <p className="text-sm font-medium text-muted-foreground">
                            Session: {session_title}
                        </p>
                    )}
                </div>
                <Button asChild>
                    <Link href="/sessions">Back to Sessions</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
