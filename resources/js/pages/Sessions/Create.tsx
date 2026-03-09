import { useState } from 'react';
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

type Committee = { id: number; name: string };

type Props = {
    committees: Committee[];
};

const textareaClassName =
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function SessionsCreate({ committees }: Props) {
    const [minutesType, setMinutesType] = useState<'upload' | 'text'>('upload');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Session" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-xl font-semibold">Create Session</h1>
                <Form
                    action="/sessions"
                    method="post"
                    className="max-w-md space-y-4"
                    encType="multipart/form-data"
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="minutes_type"
                                value={minutesType}
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="session_title">
                                    Session Title
                                </Label>
                                <Input
                                    id="session_title"
                                    name="session_title"
                                    type="text"
                                    required
                                    placeholder="e.g. Regular Council Session"
                                />
                                <InputError message={errors.session_title} />
                            </div>
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
                                <Label htmlFor="committee_id">
                                    Committee (optional)
                                </Label>
                                <select
                                    id="committee_id"
                                    name="committee_id"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">
                                        All SB Members
                                    </option>
                                    {committees.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-muted-foreground text-xs">
                                    Leave as &quot;All SB Members&quot; to
                                    include everyone; or select a committee.
                                </p>
                                <InputError message={errors.committee_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="agenda">Agenda</Label>
                                <textarea
                                    id="agenda"
                                    name="agenda"
                                    rows={4}
                                    className={textareaClassName}
                                />
                                <InputError message={errors.agenda} />
                            </div>

                            <div className="grid gap-3">
                                <Label>Minutes of the Meeting</Label>
                                <div className="flex gap-4">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="radio"
                                            name="minutes_type_radio"
                                            value="upload"
                                            checked={minutesType === 'upload'}
                                            onChange={() =>
                                                setMinutesType('upload')
                                            }
                                            className="h-4 w-4"
                                        />
                                        <span>Upload Document</span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="radio"
                                            name="minutes_type_radio"
                                            value="text"
                                            checked={minutesType === 'text'}
                                            onChange={() =>
                                                setMinutesType('text')
                                            }
                                            className="h-4 w-4"
                                        />
                                        <span>Write Minutes</span>
                                    </label>
                                </div>

                                {minutesType === 'upload' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="minutes_file">
                                            Upload Minutes File (PDF/DOC/DOCX)
                                        </Label>
                                        <input
                                            key="minutes_file"
                                            id="minutes_file"
                                            name="minutes_file"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                        <InputError
                                            message={errors.minutes_file}
                                        />
                                    </div>
                                )}

                                {minutesType === 'text' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="minutes_content">
                                            Minutes of the Meeting
                                        </Label>
                                        <textarea
                                            id="minutes_content"
                                            name="minutes_content"
                                            rows={8}
                                            className={textareaClassName}
                                            placeholder="e.g. The session started at 9:00 AM. Roll call was conducted..."
                                        />
                                        <InputError
                                            message={errors.minutes_content}
                                        />
                                    </div>
                                )}
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
