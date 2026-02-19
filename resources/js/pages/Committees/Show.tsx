import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Chair = {
    id: number;
    name: string;
};

type Member = {
    id: number;
    name: string;
};

type Committee = {
    id: number;
    name: string;
    description: string | null;
    chair_id: number | null;
    chair: Chair | null;
    members: Member[];
};

type Props = {
    committee: Committee;
    canManageMembers: boolean;
};

export default function CommitteesShow({
    committee,
    canManageMembers,
}: Props) {
    const authUser = (usePage().props as { auth?: { user?: { id: number } } })
        .auth?.user;
    const isChair = authUser && committee.chair_id === authUser.id;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Committees', href: '/committees' },
        {
            title: committee.name,
            href: `/committees/${committee.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={committee.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {committee.name}
                        </h1>
                        {committee.description && (
                            <p className="mt-2 text-muted-foreground">
                                {committee.description}
                            </p>
                        )}
                    </div>
                    {canManageMembers && (
                        <Button asChild>
                            <Link
                                href={`/committees/${committee.id}/manage-members`}
                            >
                                Manage members
                            </Link>
                        </Button>
                    )}
                </div>

                <section className="space-y-2">
                    <h2 className="text-lg font-medium">Chair</h2>
                    <div className="rounded-lg border border-sidebar-border/70 dark:border-sidebar-border p-4">
                        {committee.chair ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">
                                    {committee.chair.name}
                                </span>
                                <Badge variant="secondary">
                                    Chairperson
                                </Badge>
                                {isChair && (
                                    <span className="text-sm text-muted-foreground">
                                        You are the Chair
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                No chair assigned.
                            </p>
                        )}
                    </div>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-medium">Members</h2>
                    <div className="rounded-lg border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                        {committee.members.length === 0 ? (
                            <p className="p-4 text-muted-foreground text-sm">
                                No members assigned.
                            </p>
                        ) : (
                            <ul className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                {committee.members.map((member) => (
                                    <li
                                        key={member.id}
                                        className={
                                            committee.chair_id === member.id
                                                ? 'flex items-center gap-2 bg-muted/50 p-3 font-medium'
                                                : 'flex items-center gap-2 p-3'
                                        }
                                    >
                                        {member.name}
                                        {committee.chair_id === member.id && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                Chairperson
                                            </Badge>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
