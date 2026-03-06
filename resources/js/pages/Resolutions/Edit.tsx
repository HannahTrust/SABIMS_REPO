import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Resolutions', href: '/resolutions' },
];

type Resolution = {
    id: number;
    resolution_number: string;
    title: string;
    description: string | null;
    session_id: number;
    committee_id: number;
    status: string;
    visibility: string;
    voting_result: string | null;
    file_path: string | null;
    year: number;
};

type SessionOption = { id: number; session_date: string };
type CommitteeOption = { id: number; name: string };

type Props = {
    resolution: Resolution;
    sessions: SessionOption[];
    committees: CommitteeOption[];
};

const STATUS_OPTIONS = ['draft', 'approved', 'archived'];
const VISIBILITY_OPTIONS = [
    { value: 'private', label: 'Private' },
    { value: 'public', label: 'Public' },
] as const;

export default function ResolutionsEdit({
    resolution,
    sessions,
    committees,
}: Props) {
    const breadcrumbsWithResolution: BreadcrumbItem[] = [
        ...breadcrumbs,
        {
            title: resolution.resolution_number,
            href: `/resolutions/${resolution.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbsWithResolution}>
            <Head title={`Edit ${resolution.resolution_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-xl font-semibold">
                    Edit Resolution {resolution.resolution_number}
                </h1>
                <Form
                    action={`/resolutions/${resolution.id}`}
                    method="put"
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
                                    defaultValue={
                                        resolution.resolution_number
                                    }
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
                                    defaultValue={resolution.title}
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
                                    defaultValue={
                                        resolution.description ?? ''
                                    }
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
                                    defaultValue={resolution.session_id}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
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
                                    defaultValue={resolution.committee_id}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
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
                                    defaultValue={resolution.status}
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
                                <Label htmlFor="visibility">Visibility</Label>
                                <select
                                    id="visibility"
                                    name="visibility"
                                    required
                                    defaultValue={resolution.visibility ?? 'private'}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    {VISIBILITY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.visibility} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="voting_result">
                                    Voting Result
                                </Label>
                                <Input
                                    id="voting_result"
                                    name="voting_result"
                                    defaultValue={
                                        resolution.voting_result ?? ''
                                    }
                                    autoComplete="off"
                                />
                                <InputError message={errors.voting_result} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="file_path">File Path</Label>
                                <Input
                                    id="file_path"
                                    name="file_path"
                                    defaultValue={resolution.file_path ?? ''}
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
                                    defaultValue={resolution.year}
                                    min={2000}
                                    max={2100}
                                />
                                <InputError message={errors.year} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Update'}
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
