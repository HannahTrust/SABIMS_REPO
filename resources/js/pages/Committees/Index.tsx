import { Form, Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Committees',
        href: '/committees',
    },
];

type Committee = {
    id: number;
    name: string;
    description: string | null;
    chair_id: number | null;
    created_by: number | null;
    created_at: string;
};

type Props = {
    committees: Committee[];
    canCreate: boolean;
    canManageMembers: boolean;
};

export default function CommitteesIndex({
    committees,
    canCreate,
    canManageMembers,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Committees" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash?.status && (
                    <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {flash.status}
                    </p>
                )}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-semibold">Committees</h1>
                    {canCreate && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Create Committee</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>Create Committee</DialogTitle>
                                <DialogDescription>
                                    Add a new committee. Enter the name and
                                    optional description.
                                </DialogDescription>
                                <Form
                                    action="/committees"
                                    method="post"
                                    options={{
                                        preserveScroll: true,
                                    }}
                                    resetOnSuccess
                                    className="space-y-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    required
                                                    placeholder="Committee name"
                                                    autoComplete="off"
                                                />
                                                <InputError
                                                    className="mt-1"
                                                    message={errors.name}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="description">
                                                    Description
                                                </Label>
                                                <Input
                                                    id="description"
                                                    name="description"
                                                    placeholder="Optional description"
                                                    autoComplete="off"
                                                />
                                                <InputError
                                                    className="mt-1"
                                                    message={
                                                        errors.description
                                                    }
                                                />
                                            </div>
                                            <DialogFooter className="gap-2">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    {processing
                                                        ? 'Creating…'
                                                        : 'Create Committee'}
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="rounded-lg border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    {committees.length === 0 ? (
                        <p className="p-6 text-muted-foreground text-sm">
                            No committees yet.
                            {canCreate &&
                                ' Click "Create Committee" to add one.'}
                        </p>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border/70 dark:border-sidebar-border bg-muted/50">
                                    <th className="p-3 font-medium">Name</th>
                                    <th className="p-3 font-medium">
                                        Description
                                    </th>
                                    <th className="p-3 font-medium">
                                        Created
                                    </th>
                                    {canManageMembers && (
                                        <th className="p-3 font-medium">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {committees.map((committee) => (
                                    <tr
                                        key={committee.id}
                                        className="border-b border-sidebar-border/70 dark:border-sidebar-border last:border-b-0"
                                    >
                                        <td className="p-3 font-medium">
                                            <Link
                                                href={`/committees/${committee.id}`}
                                                className="text-primary underline underline-offset-2 hover:no-underline"
                                            >
                                                {committee.name}
                                            </Link>
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {committee.description ?? '—'}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {new Date(
                                                committee.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        {canManageMembers && (
                                            <td className="p-3">
                                                <Link
                                                    href={`/committees/${committee.id}/manage-members`}
                                                    className="text-primary underline underline-offset-2 hover:no-underline"
                                                >
                                                    Manage members
                                                </Link>
                                            </td>
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
