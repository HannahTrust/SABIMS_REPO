import { useState } from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Hash, AlignLeft, Calendar, Users, BarChart2, Vote, Paperclip, ArrowLeft, Lock, Globe } from 'lucide-react';

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

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'approved', label: 'Approved' },
    { value: 'archived', label: 'Archived' },
];

function FieldIcon({ children }: { children: React.ReactNode }) {
    return (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {children}
        </span>
    );
}

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const VISIBILITY_OPTIONS = [
    { value: 'private', label: 'Private', description: 'Visible only to internal roles' },
    { value: 'public', label: 'Public', description: 'Visible to everyone' },
] as const;

export default function ResolutionsCreate({ sessions, committees }: Props) {
    const currentYear = new Date().getFullYear();
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Resolution" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold leading-tight">File a Resolution</h1>
                        <p className="text-xs text-muted-foreground">Complete all required fields below</p>
                    </div>
                </div>

                                <Form
                    action="/resolutions"
                    method="post"
                    className="w-full max-w-2xl"
                >
                    {({ processing, errors }) => (
                        <>
                    <input type="hidden" name="visibility" value={visibility} />
                        <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                            {/* Section: Basic Info */}
                            <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Basic Information
                                </p>
                            </div>
                            <div className="grid gap-5 p-5 sm:grid-cols-2">
                                {/* Resolution Number */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="resolution_number" className="text-sm font-medium">
                                        Resolution Number <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon><Hash className="h-4 w-4" /></FieldIcon>
                                        <Input
                                            id="resolution_number"
                                            name="resolution_number"
                                            required
                                            placeholder="e.g. 2025-001"
                                            autoComplete="off"
                                            className="pl-9"
                                        />
                                    </div>
                                    <InputError message={errors.resolution_number} />
                                </div>

                                {/* Year */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="year" className="text-sm font-medium">
                                        Year <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon><Calendar className="h-4 w-4" /></FieldIcon>
                                        <Input
                                            id="year"
                                            name="year"
                                            type="number"
                                            required
                                            defaultValue={currentYear}
                                            min={2000}
                                            max={2100}
                                            className="pl-9"
                                        />
                                    </div>
                                    <InputError message={errors.year} />
                                </div>

                                {/* Title — full width */}
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="title" className="text-sm font-medium">
                                        Title <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon><AlignLeft className="h-4 w-4" /></FieldIcon>
                                        <Input
                                            id="title"
                                            name="title"
                                            required
                                            placeholder="Full title of the resolution"
                                            autoComplete="off"
                                            className="pl-9"
                                        />
                                    </div>
                                    <InputError message={errors.title} />
                                </div>

                                {/* Description — full width */}
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="description" className="text-sm font-medium">
                                        Description
                                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
                                    </Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        placeholder="Brief description or summary of the resolution…"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            {/* Section: Classification */}
                            <div className="border-y border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Classification
                                </p>
                            </div>
                            <div className="grid gap-5 p-5 sm:grid-cols-2">
                                {/* Session */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="session_id" className="text-sm font-medium">
                                        Session <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon><Calendar className="h-4 w-4" /></FieldIcon>
                                        <select id="session_id" name="session_id" required className={selectClass}>
                                            <option value="">Select session</option>
                                            {sessions.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.session_date}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputError message={errors.session_id} />
                                </div>

                                {/* Committee */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="committee_id" className="text-sm font-medium">
                                        Committee <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon><Users className="h-4 w-4" /></FieldIcon>
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

                                {/* Status */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="status" className="text-sm font-medium">
                                        Status <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon><BarChart2 className="h-4 w-4" /></FieldIcon>
                                        <select id="status" name="status" required className={selectClass}>
                                            {STATUS_OPTIONS.map((st) => (
                                                <option key={st.value} value={st.value}>
                                                    {st.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputError message={errors.status} />
                                </div>

                                {/* Voting Result */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="voting_result" className="text-sm font-medium">
                                        Voting Result
                                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon><Vote className="h-4 w-4" /></FieldIcon>
                                        <Input
                                            id="voting_result"
                                            name="voting_result"
                                            placeholder="e.g. 10-0-1"
                                            autoComplete="off"
                                            className="pl-9"
                                        />
                                    </div>
                                    <InputError message={errors.voting_result} />
                                </div>

                                {/* Visibility */}
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label className="text-sm font-medium">
                                        Visibility <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex flex-wrap gap-4">
                                        {VISIBILITY_OPTIONS.map((opt) => (
                                            <label
                                                key={opt.value}
                                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm has-[:checked]:ring-2 has-[:checked]:ring-ring"
                                            >
                                                <input
                                                    type="radio"
                                                    name="visibility_radio"
                                                    value={opt.value}
                                                    checked={visibility === opt.value}
                                                    onChange={() => setVisibility(opt.value)}
                                                    className="h-4 w-4"
                                                />
                                                {opt.value === 'private' ? (
                                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="font-medium">{opt.label}</span>
                                                <span className="text-muted-foreground">— {opt.description}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.visibility} />
                                </div>
                            </div>

                            {/* Section: Attachment */}
                            <div className="border-y border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Attachment
                                </p>
                            </div>
                            <div className="p-5">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="file_path" className="text-sm font-medium">
                                        File Path
                                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon><Paperclip className="h-4 w-4" /></FieldIcon>
                                        <Input
                                            id="file_path"
                                            name="file_path"
                                            placeholder="e.g. /files/resolutions/2025-001.pdf"
                                            autoComplete="off"
                                            className="pl-9"
                                        />
                                    </div>
                                    <InputError message={errors.file_path} />
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="flex items-center justify-between gap-3 rounded-b-xl border-t border-sidebar-border/70 bg-muted/30 px-5 py-4 dark:border-sidebar-border">
                                <Button type="button" variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
                                    <Link href="/resolutions">
                                        <ArrowLeft className="h-4 w-4" />
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing} size="sm" className="min-w-[120px] gap-2">
                                    {processing ? (
                                        <>
                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Filing…
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-3.5 w-3.5" />
                                            File Resolution
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}