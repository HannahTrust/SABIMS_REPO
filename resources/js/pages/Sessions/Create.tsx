import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sessions', href: '/sessions' },
    { title: 'Create', href: '/sessions/create' },
];

type Props = Record<string, never>;

export default function SessionsCreate(_props: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Session" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-xl font-semibold">Create Session</h1>
                <Form
                    action="/sessions"
                    method="post"
                    className="max-w-md space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="session_date">Session Date</Label>
                                <Input
                                    id="session_date"
                                    name="session_date"
                                    type="date"
                                    required
                                />
                                <InputError message={errors.session_date} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="agenda">Agenda</Label>
                                <textarea
                                    id="agenda"
                                    name="agenda"
                                    rows={4}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <InputError message={errors.agenda} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="minutes_file">
                                    Minutes File (path)
                                </Label>
                                <Input
                                    id="minutes_file"
                                    name="minutes_file"
                                    placeholder="Optional"
                                    autoComplete="off"
                                />
                                <InputError message={errors.minutes_file} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating…' : 'Create'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/sessions">Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
