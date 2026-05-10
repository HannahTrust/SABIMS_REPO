import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AlignLeft, ArrowLeft, Calendar, FileText, Hash, Paperclip, Users } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { ORDINANCE_STATUS_CONFIG, isOrdinanceStatus } from '@/constants/ordinance';
import type { BreadcrumbItem } from '@/types';

type SessionOption = { id: number; session_date: string };
type CommitteeOption = { id: number; name: string };

type Ordinance = {
    id: number;
    title: string;
    ordinance_number: string | null;
    description: string | null;
    committee_id: number;
    session_id: number | null;
    status: string;
    file_path: string | null;
    file_url: string | null;
};

type Props = {
    ordinance: Ordinance;
    sessions: SessionOption[];
    committees: CommitteeOption[];
    statuses: string[];
};

function FieldIcon({ children }: { children: React.ReactNode }) {
    return (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {children}
        </span>
    );
}

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function OrdinancesEdit({ ordinance, sessions, committees, statuses }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Ordinances', href: '/ordinances' },
        { title: ordinance.ordinance_number ?? `#${ordinance.id}`, href: `/ordinances/${ordinance.id}/edit` },
    ];

    const [selectedFileName, setSelectedFileName] = useState<string>('');

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={`Edit ${ordinance.ordinance_number ?? `Ordinance #${ordinance.id}`}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold leading-tight">Edit Ordinance</h1>
                        <p className="text-xs text-muted-foreground">
                            {ordinance.ordinance_number ?? `ID ${ordinance.id}`}
                        </p>
                    </div>
                </div>

                <Form
                    action={`/ordinances/${ordinance.id}`}
                    method="put"
                    encType="multipart/form-data"
                    className="w-full max-w-2xl"
                >
                    {({ processing, errors }) => (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                            <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Details
                                </p>
                            </div>
                            <div className="grid gap-5 p-5 sm:grid-cols-2">
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="title" className="text-sm font-medium">
                                        Title <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <AlignLeft className="h-4 w-4" />
                                        </FieldIcon>
                                        <Input
                                            id="title"
                                            name="title"
                                            required
                                            defaultValue={ordinance.title}
                                            className="pl-9"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <InputError message={errors.title} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="ordinance_number" className="text-sm font-medium">
                                        Ordinance Number
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Hash className="h-4 w-4" />
                                        </FieldIcon>
                                        <Input
                                            id="ordinance_number"
                                            name="ordinance_number"
                                            defaultValue={ordinance.ordinance_number ?? ''}
                                            className="pl-9"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <InputError message={errors.ordinance_number} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="status" className="text-sm font-medium">
                                        Status <span className="text-destructive">*</span>
                                    </Label>
                                    <select
                                        id="status"
                                        name="status"
                                        required
                                        defaultValue={ordinance.status}
                                        className={selectClass}
                                    >
                                        {statuses.map((st) => (
                                            <option key={st} value={st}>
                                                {isOrdinanceStatus(st) ? ORDINANCE_STATUS_CONFIG[st].label : st}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="committee_id" className="text-sm font-medium">
                                        Committee <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Users className="h-4 w-4" />
                                        </FieldIcon>
                                        <select
                                            id="committee_id"
                                            name="committee_id"
                                            required
                                            defaultValue={ordinance.committee_id}
                                            className={selectClass}
                                        >
                                            {committees.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputError message={errors.committee_id} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="session_id" className="text-sm font-medium">
                                        Session
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Calendar className="h-4 w-4" />
                                        </FieldIcon>
                                        <select
                                            id="session_id"
                                            name="session_id"
                                            defaultValue={ordinance.session_id ?? ''}
                                            className={selectClass}
                                        >
                                            <option value="">No session</option>
                                            {sessions.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.session_date}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputError message={errors.session_id} />
                                </div>

                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="description" className="text-sm font-medium">
                                        Description
                                    </Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        defaultValue={ordinance.description ?? ''}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            <div className="border-y border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Document
                                </p>
                            </div>
                            <div className="grid gap-4 p-5">
                                {ordinance.file_url ? (
                                    <div className="rounded-lg border border-sidebar-border/70 bg-muted/20 p-4 text-sm dark:border-sidebar-border">
                                        <p className="font-medium">Current document</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-3">
                                            <a
                                                href={ordinance.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                View / Download
                                            </a>
                                            <label className="flex items-center gap-2 text-muted-foreground">
                                                <input type="checkbox" name="remove_document" value="1" />
                                                Remove document
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No document uploaded.</p>
                                )}

                                <div className="grid gap-1.5">
                                    <Label htmlFor="document" className="text-sm font-medium">
                                        Upload new document (replaces existing)
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Paperclip className="h-4 w-4" />
                                        </FieldIcon>
                                        <Input
                                            id="document"
                                            name="document"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            className="pl-9"
                                            onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name ?? '')}
                                        />
                                    </div>
                                    {selectedFileName && (
                                        <p className="text-xs text-muted-foreground">Selected: {selectedFileName}</p>
                                    )}
                                    <InputError message={errors.document} />
                                    <InputError message={errors.remove_document} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 rounded-b-xl border-t border-sidebar-border/70 bg-muted/30 px-5 py-4 dark:border-sidebar-border">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="gap-1.5 text-muted-foreground"
                                >
                                    <Link href={`/ordinances/${ordinance.id}`}>
                                        <ArrowLeft className="h-4 w-4" />
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing} size="sm" className="min-w-[140px] gap-2">
                                    {processing ? 'Saving…' : 'Update Ordinance'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}

