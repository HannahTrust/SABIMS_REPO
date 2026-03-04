import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Resolutions', href: '/resolutions' },
    { title: 'Create', href: '/resolutions/create' },
];

type SessionOption = { id: number; session_date: string };
type CommitteeOption = { id: number; name: string };

type Props = {
    sessions: SessionOption[];
    committees: CommitteeOption[];
};

const STATUS_OPTIONS = ['draft', 'approved', 'archived'];

export default function ResolutionsCreate({
    sessions,
    committees,
}: Props) {
    const currentYear = new Date().getFullYear();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Resolution" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-xl font-semibold">Create Resolution</h1>
                <Form
                    action="/resolutions"
                    method="post"
                    className="max-w-md space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="resolution_number">
                                    Resolution Number
                                </Label>
                                <Input
                                    id="resolution_number"
                                    name="resolution_number"
                                    required
                                    placeholder="e.g. 2025-001"
                                    autoComplete="off"
                                />
                                <InputError
                                    message={errors.resolution_number}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="Resolution title"
                                    autoComplete="off"
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    Description
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="session_id">Session</Label>
                                <select
                                    id="session_id"
                                    name="session_id"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">
                                        Select session
                                    </option>
                                    {sessions.map((s) => (
                                        <option
                                            key={s.id}
                                            value={s.id}
                                        >
                                            {s.session_date}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.session_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="committee_id">Committee</Label>
                                <select
                                    id="committee_id"
                                    name="committee_id"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">
                                        Select committee
                                    </option>
                                    {committees.map((c) => (
                                        <option
                                            key={c.id}
                                            value={c.id}
                                        >
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.committee_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    {STATUS_OPTIONS.map((st) => (
                                        <option
                                            key={st}
                                            value={st}
                                        >
                                            {st}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.status} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="voting_result">
                                    Voting Result
                                </Label>
                                <Input
                                    id="voting_result"
                                    name="voting_result"
                                    placeholder="Optional"
                                    autoComplete="off"
                                />
                                <InputError message={errors.voting_result} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="file_path">File Path</Label>
                                <Input
                                    id="file_path"
                                    name="file_path"
                                    placeholder="Optional"
                                    autoComplete="off"
                                />
                                <InputError message={errors.file_path} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={currentYear}
                                    min={2000}
                                    max={2100}
                                />
                                <InputError message={errors.year} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating…' : 'Create'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/resolutions">Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
