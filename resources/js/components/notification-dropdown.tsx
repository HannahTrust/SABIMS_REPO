import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function NotificationDropdown() {
    const { auth, notifications } = usePage().props;
    const user = auth?.user;
    const list = Array.isArray(notifications) ? notifications : [];

    if (!user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {list.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {list.length > 9 ? '9+' : list.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
                {list.length === 0 ? (
                    <div className="px-2 py-4 text-center text-muted-foreground text-sm">
                        No new notifications
                    </div>
                ) : (
                    list.map((n) => (
                        <DropdownMenuItem key={n.id} asChild>
                            {String(n.type).includes('SessionCreatedNotification') &&
                            n.data?.session_id ? (
                                <Link
                                    href={`/sessions/${n.data.session_id}`}
                                    className="block cursor-pointer py-2"
                                >
                                    <span className="font-medium">
                                        {typeof n.data.title === 'string'
                                            ? n.data.title
                                            : 'New Session Scheduled'}
                                    </span>
                                    <span className="mt-0.5 block text-muted-foreground text-xs">
                                        {typeof n.data.message === 'string'
                                            ? n.data.message
                                            : 'You have been scheduled to attend a session.'}
                                    </span>
                                    {n.data.session_date && (
                                        <span className="mt-0.5 block text-muted-foreground text-xs">
                                            {String(n.data.session_date)}
                                            {n.data.committee
                                                ? ` · ${String(n.data.committee)}`
                                                : ''}
                                        </span>
                                    )}
                                </Link>
                            ) : (
                                <span className="block py-2">
                                    <span className="font-medium">
                                        {typeof n.data?.title === 'string'
                                            ? n.data.title
                                            : 'Notification'}
                                    </span>
                                    {typeof n.data?.message === 'string' && (
                                        <span className="mt-0.5 block text-muted-foreground text-xs">
                                            {n.data.message}
                                        </span>
                                    )}
                                </span>
                            )}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
