import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type MyCommittee = {
    id: number;
    name: string;
    is_chair: boolean;
};

type Props = {
    role: string | null;
    my_committees: MyCommittee[];
    total_committees: number | null;
    total_committees_with_chair: number | null;
    total_members: number | null;
};

function StatCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-lg border border-sidebar-border/70 dark:border-sidebar-border bg-card p-4">
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
    );
}

export default function Dashboard({
    role,
    my_committees,
    total_committees,
    total_committees_with_chair,
    total_members,
}: Props) {
    const showOverview =
        role === 'vice_mayor' ||
        role === 'admin';
    const showSecretarySummary = role === 'secretary';
    const showMyCommittees = role === 'sb_member';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {showMyCommittees && (
                    <section>
                        <h2 className="mb-3 text-lg font-medium">
                            My Committees
                        </h2>
                        <div className="rounded-lg border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                            {my_committees.length === 0 ? (
                                <p className="p-4 text-sm text-muted-foreground">
                                    You are not assigned to any committees.
                                </p>
                            ) : (
                                <ul className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                    {my_committees.map((committee) => (
                                        <li
                                            key={committee.id}
                                            className="flex items-center gap-2 p-3"
                                        >
                                            <Link
                                                href={`/committees/${committee.id}`}
                                                className="font-medium text-primary underline underline-offset-2 hover:no-underline"
                                            >
                                                {committee.name}
                                            </Link>
                                            {committee.is_chair && (
                                                <Badge variant="secondary">
                                                    Chairperson
                                                </Badge>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                )}

                {showOverview && total_committees !== null && (
                    <section>
                        <h2 className="mb-3 text-lg font-medium">
                            Committee Overview
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                label="Total Committees"
                                value={total_committees}
                            />
                            <StatCard
                                label="Committees with Chair Assigned"
                                value={
                                    total_committees_with_chair ?? 0
                                }
                            />
                            <StatCard
                                label="Total Committee Members"
                                value={total_members ?? 0}
                            />
                        </div>
                    </section>
                )}

                {showSecretarySummary && total_committees !== null && (
                    <section>
                        <h2 className="mb-3 text-lg font-medium">
                            Committee Summary
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-1 max-w-xs">
                            <StatCard
                                label="Total Committees"
                                value={total_committees}
                            />
                        </div>
                    </section>
                )}

                {!showMyCommittees &&
                    !showOverview &&
                    !showSecretarySummary && (
                        <p className="text-muted-foreground text-sm">
                            Welcome. No dashboard content for your role.
                        </p>
                    )}
            </div>
        </AppLayout>
    );
}
