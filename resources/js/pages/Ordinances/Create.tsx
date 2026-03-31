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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ordinances', href: '/ordinances' },
    { title: 'Create', href: '/ordinances/create' },
];

type SessionOption = { id: number; session_date: string };
type CommitteeOption = { id: number; name: string };

type Props = {
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

export default function OrdinancesCreate({ sessions, committees, statuses }: Props) {
    const [selectedFileName, setSelectedFileName] = useState<string>('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Ordinance" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold leading-tight">Create Ordinance</h1>
                        <p className="text-xs text-muted-foreground">Secretary-only. Draft or Reviewed only.</p>
                    </div>
                </div>

                <Form action="/ordinances" method="post" encType="multipart/form-data" className="w-full max-w-2xl">
                    {({ processing, errors }) => (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                            <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Basic Information
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
                                        <Input id="title" name="title" required className="pl-9" autoComplete="off" />
                                    </div>
                                    <InputError message={errors.title} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="ordinance_number" className="text-sm font-medium">
                                        Ordinance Number
                                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Hash className="h-4 w-4" />
                                        </FieldIcon>
                                        <Input
                                            id="ordinance_number"
                                            name="ordinance_number"
                                            placeholder="e.g. 2026-001"
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
                                    <select id="status" name="status" required className={selectClass}>
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
                                        <select id="committee_id" name="committee_id" required className={selectClass}>
                                            <option value="">Select committee</option>
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
                                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Calendar className="h-4 w-4" />
                                        </FieldIcon>
                                        <select id="session_id" name="session_id" className={selectClass}>
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
                                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                        placeholder="Brief summary of the ordinance…"
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            <div className="border-y border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Document Upload
                                </p>
                            </div>
                            <div className="p-5">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="document" className="text-sm font-medium">
                                        Document (PDF/DOC/DOCX)
                                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                            (optional)
                                        </span>
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
                                            onChange={(e) =>
                                                setSelectedFileName(e.target.files?.[0]?.name ?? '')
                                            }
                                        />
                                    </div>
                                    {selectedFileName && (
                                        <p className="text-xs text-muted-foreground">Selected: {selectedFileName}</p>
                                    )}
                                    <InputError message={errors.document} />
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
                                    <Link href="/ordinances">
                                        <ArrowLeft className="h-4 w-4" />
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing} size="sm" className="min-w-[140px] gap-2">
                                    {processing ? 'Saving…' : 'Create Ordinance'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}

