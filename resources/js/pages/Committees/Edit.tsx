import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Committee = {
    id: number;
    name: string;
    description: string | null;
};

type Props = {
    committee: Committee;
};

export default function CommitteesEdit({ committee }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Committees', href: '/committees' },
        { title: committee.name, href: `/committees/${committee.id}` },
        { title: 'Edit', href: `/committees/${committee.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${committee.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-xl font-semibold">Edit Committee</h1>
                <Form
                    action={`/committees/${committee.id}`}
                    method="put"
                    className="max-w-md space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={committee.name}
                                    autoComplete="off"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    defaultValue={committee.description ?? ''}
                                    autoComplete="off"
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Update'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={`/committees/${committee.id}`}>
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
