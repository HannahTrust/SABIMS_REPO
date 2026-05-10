import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Plus, Trash2, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { ResidentSearchSelect } from '@/components/blotter/resident-search-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blotter Reports', href: '/blotter-reports' },
    { title: 'Create', href: '/blotter-reports/create' },
];

const blotterSchema = z
    .object({
        purok_id: z.string().optional(),
        incident_type_id: z.string().min(1, 'Incident type is required'),
        incident_datetime: z.string().min(1, 'Incident date/time is required'),
        incident_location: z.string().min(3, 'Incident location is required'),
        complainant_id: z.string().min(1, 'Complainant is required'),
        respondent_mode: z.enum(['resident', 'outsider']),
        respondent_id: z.string().optional(),
        respondent_name: z.string().optional(),
        narrative: z.string().min(20, 'Narrative must be at least 20 characters'),
        action_taken: z.string().optional(),
        remarks: z.string().optional(),
        assigned_to: z.string().optional(),
        status: z.enum(['pending', 'under_mediation', 'scheduled', 'resolved', 'elevated', 'archived']),
        settlement_date: z.string().optional(),
        witnesses: z.array(
            z.object({
                name: z.string().min(2, 'Witness name is required'),
                contact: z.string().optional(),
                statement: z.string().optional(),
            }),
        ),
        attachments: z.array(z.instanceof(File)).max(5, 'Maximum 5 attachments'),
    })
    .superRefine((values, ctx) => {
        if (values.respondent_mode === 'resident' && (!values.respondent_id || values.respondent_id.trim() === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Respondent resident is required',
                path: ['respondent_id'],
            });
        }

        if (values.respondent_mode === 'outsider' && (!values.respondent_name || values.respondent_name.trim() === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Outsider respondent name is required',
                path: ['respondent_name'],
            });
        }

        for (const [idx, file] of values.attachments.entries()) {
            const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowed.includes(file.type)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Attachment must be PDF, JPG, or PNG',
                    path: ['attachments', idx],
                });
            }
            if (file.size > 10 * 1024 * 1024) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Attachment exceeds 10MB',
                    path: ['attachments', idx],
                });
            }
        }
    });

type CreateBlotterForm = z.infer<typeof blotterSchema>;

type Option = { id: number; name: string };

type Props = {
    incidentTypes: Option[];
    residents: Option[];
    officers: Option[];
    purokOptions: string[];
};

const stepTitles = [
    'Incident Information',
    'Complainant & Respondent',
    'Narrative & Action Taken',
    'Witnesses',
    'Attachments',
    'Review & Submit',
];

const defaultValues: CreateBlotterForm = {
    purok_id: '',
    incident_type_id: '',
    incident_datetime: '',
    incident_location: '',
    complainant_id: '',
    respondent_mode: 'resident',
    respondent_id: '',
    respondent_name: '',
    narrative: '',
    action_taken: '',
    remarks: '',
    assigned_to: '',
    status: 'pending',
    settlement_date: '',
    witnesses: [],
    attachments: [],
};

export default function BlotterCreate({ incidentTypes, residents, officers, purokOptions }: Props) {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        control,
        setValue,
        watch,
        trigger,
        formState: { errors },
        handleSubmit,
    } = useForm<CreateBlotterForm>({
        resolver: zodResolver(blotterSchema),
        defaultValues,
    });

    const witnessesFieldArray = useFieldArray({
        control,
        name: 'witnesses',
    });

    const attachments = watch('attachments');
    const respondentMode = watch('respondent_mode');
    const complainantId = watch('complainant_id');
    const respondentId = watch('respondent_id');

    const residentsForRespondent = useMemo(() => {
        if (!complainantId) {
            return residents;
        }
        return residents.filter((r) => String(r.id) !== complainantId);
    }, [residents, complainantId]);

    useEffect(() => {
        if (respondentMode === 'resident' && complainantId && respondentId && complainantId === respondentId) {
            setValue('respondent_id', '', { shouldValidate: true });
        }
    }, [complainantId, respondentId, respondentMode, setValue]);

    const stepFields: Array<Array<keyof CreateBlotterForm>> = useMemo(
        () => [
            ['incident_type_id', 'incident_datetime', 'incident_location', 'purok_id'],
            ['complainant_id', 'respondent_mode', 'respondent_id', 'respondent_name'],
            ['narrative', 'action_taken', 'remarks', 'assigned_to', 'status', 'settlement_date'],
            ['witnesses'],
            ['attachments'],
            [],
        ],
        [],
    );

    const nextStep = async () => {
        const fields = stepFields[step];
        const isValid = fields.length > 0 ? await trigger(fields) : true;
        if (!isValid) return;
        setStep((prev) => Math.min(prev + 1, stepTitles.length - 1));
    };

    const previousStep = () => setStep((prev) => Math.max(prev - 1, 0));

    const onSubmit = (values: CreateBlotterForm) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('purok_id', values.purok_id ?? '');
        formData.append('incident_type_id', values.incident_type_id);
        formData.append('incident_datetime', values.incident_datetime);
        formData.append('incident_location', values.incident_location);
        formData.append('complainant_id', values.complainant_id);
        formData.append('respondent_id', values.respondent_mode === 'resident' ? values.respondent_id ?? '' : '');
        formData.append('respondent_name', values.respondent_mode === 'outsider' ? values.respondent_name ?? '' : '');
        formData.append('narrative', values.narrative);
        formData.append('action_taken', values.action_taken ?? '');
        formData.append('remarks', values.remarks ?? '');
        formData.append('assigned_to', values.assigned_to ?? '');
        formData.append('status', values.status);
        formData.append('settlement_date', values.settlement_date ?? '');

        values.witnesses.forEach((witness, index) => {
            formData.append(`witnesses[${index}][name]`, witness.name);
            formData.append(`witnesses[${index}][contact]`, witness.contact ?? '');
            formData.append(`witnesses[${index}][statement]`, witness.statement ?? '');
        });

        values.attachments.forEach((file) => formData.append('attachments[]', file));

        router.post('/blotter-reports', formData, {
            forceFormData: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Create Blotter Report" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold leading-tight">Create Blotter Report</h1>
                        <p className="text-xs text-muted-foreground">
                            Step {step + 1} of {stepTitles.length}: {stepTitles[step]}
                        </p>
                    </div>
                </div>

                <div className="grid gap-2 md:grid-cols-6">
                    {stepTitles.map((title, idx) => (
                        <div
                            key={title}
                            className={`rounded-md border px-3 py-2 text-xs ${
                                idx === step
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : idx < step
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                      : 'border-sidebar-border/70 text-muted-foreground dark:border-sidebar-border'
                            }`}
                        >
                            <p className="font-medium">{title}</p>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                    {step === 0 && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label>Incident Type *</Label>
                                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...register('incident_type_id')}>
                                    <option value="">Select incident type</option>
                                    {incidentTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-destructive">{errors.incident_type_id?.message}</p>
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Incident Date & Time *</Label>
                                <Input type="datetime-local" {...register('incident_datetime')} />
                                <p className="text-xs text-destructive">{errors.incident_datetime?.message}</p>
                            </div>
                            <div className="grid gap-1.5 md:col-span-2">
                                <Label>Incident Location *</Label>
                                <Input placeholder="e.g. Purok 3 Covered Court" {...register('incident_location')} />
                                <p className="text-xs text-destructive">{errors.incident_location?.message}</p>
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Purok</Label>
                                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...register('purok_id')}>
                                    <option value="">Select purok</option>
                                    {purokOptions.map((purok) => (
                                        <option key={purok} value={purok}>
                                            Purok {purok}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                name="complainant_id"
                                control={control}
                                render={({ field }) => (
                                    <ResidentSearchSelect
                                        id="blotter-complainant"
                                        label="Complainant (Resident)"
                                        options={residents}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.complainant_id?.message}
                                        required
                                    />
                                )}
                            />

                            <div className="grid gap-1.5">
                                <Label>Respondent Type *</Label>
                                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...register('respondent_mode')}>
                                    <option value="resident">Resident</option>
                                    <option value="outsider">Outsider</option>
                                </select>
                            </div>

                            {respondentMode === 'resident' ? (
                                <div className="md:col-span-2">
                                    <Controller
                                        name="respondent_id"
                                        control={control}
                                        render={({ field }) => (
                                            <ResidentSearchSelect
                                                id="blotter-respondent"
                                                label="Respondent Resident"
                                                options={residentsForRespondent}
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={errors.respondent_id?.message}
                                                required
                                                emptyMessage={
                                                    complainantId
                                                        ? 'No other residents match your search (complainant is excluded).'
                                                        : 'No residents match your search.'
                                                }
                                            />
                                        )}
                                    />
                                </div>
                            ) : (
                                <div className="grid gap-1.5 md:col-span-2">
                                    <Label>Outsider Respondent Name *</Label>
                                    <Input placeholder="Full name of outsider respondent" {...register('respondent_name')} />
                                    <p className="text-xs text-destructive">{errors.respondent_name?.message}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label>Narrative *</Label>
                                <textarea
                                    rows={6}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Detailed incident narrative..."
                                    {...register('narrative')}
                                />
                                <p className="text-xs text-destructive">{errors.narrative?.message}</p>
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Action Taken</Label>
                                <textarea rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('action_taken')} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Remarks</Label>
                                <textarea rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('remarks')} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-1.5">
                                    <Label>Assigned Officer</Label>
                                    <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...register('assigned_to')}>
                                        <option value="">Unassigned</option>
                                        {officers.map((officer) => (
                                            <option key={officer.id} value={officer.id}>
                                                {officer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Status *</Label>
                                    <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...register('status')}>
                                        <option value="pending">Pending</option>
                                        <option value="under_mediation">Under Mediation</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="elevated">Elevated</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Settlement Date</Label>
                                    <Input type="date" {...register('settlement_date')} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Witnesses</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => witnessesFieldArray.append({ name: '', contact: '', statement: '' })}
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Add Witness
                                </Button>
                            </div>

                            {witnessesFieldArray.fields.length === 0 && (
                                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No witnesses added yet.</p>
                            )}

                            {witnessesFieldArray.fields.map((field, index) => (
                                <div key={field.id} className="grid gap-3 rounded-lg border p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Witness #{index + 1}</p>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => witnessesFieldArray.remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label>Name *</Label>
                                            <Input {...register(`witnesses.${index}.name`)} />
                                            <p className="text-xs text-destructive">{errors.witnesses?.[index]?.name?.message}</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label>Contact</Label>
                                            <Input {...register(`witnesses.${index}.contact`)} />
                                        </div>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label>Statement</Label>
                                        <textarea rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register(`witnesses.${index}.statement`)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label>Attachments (PDF/JPG/PNG, max 10MB each)</Label>
                                <Input
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(event) => setValue('attachments', Array.from(event.target.files ?? []), { shouldValidate: true })}
                                />
                                <p className="text-xs text-muted-foreground">Maximum 5 files.</p>
                                <p className="text-xs text-destructive">{errors.attachments?.message as string | undefined}</p>
                            </div>

                            {attachments.length > 0 && (
                                <div className="rounded-lg border p-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected Files</p>
                                    <ul className="space-y-1 text-sm">
                                        {attachments.map((file, idx) => (
                                            <li key={`${file.name}-${idx}`} className="flex items-center gap-2">
                                                <Upload className="h-4 w-4 text-muted-foreground" />
                                                {file.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 5 && (
                        <div className="grid gap-4">
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                                    <div>
                                        <p className="text-sm font-medium">Review before submit</p>
                                        <p className="text-xs">Verify details, witnesses, and attachments before creating the blotter report.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 rounded-lg border p-4 text-sm">
                                <p><span className="font-medium">Incident Type:</span> {incidentTypes.find((i) => String(i.id) === watch('incident_type_id'))?.name ?? '—'}</p>
                                <p><span className="font-medium">Complainant:</span> {residents.find((r) => String(r.id) === watch('complainant_id'))?.name ?? '—'}</p>
                                <p>
                                    <span className="font-medium">Respondent:</span>{' '}
                                    {respondentMode === 'resident'
                                        ? residents.find((r) => String(r.id) === watch('respondent_id'))?.name ?? '—'
                                        : watch('respondent_name') || '—'}
                                </p>
                                <p><span className="font-medium">Location:</span> {watch('incident_location') || '—'}</p>
                                <p><span className="font-medium">Date/Time:</span> {watch('incident_datetime') || '—'}</p>
                                <p><span className="font-medium">Witnesses:</span> {watch('witnesses').length}</p>
                                <p><span className="font-medium">Attachments:</span> {watch('attachments').length}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-between border-t border-sidebar-border/70 pt-4 dark:border-sidebar-border">
                        <Button type="button" variant="ghost" asChild>
                            <Link href="/blotter-reports">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Cancel
                            </Link>
                        </Button>

                        <div className="flex items-center gap-2">
                            {step > 0 && (
                                <Button type="button" variant="outline" onClick={previousStep}>
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                            )}
                            {step < stepTitles.length - 1 ? (
                                <Button type="button" onClick={nextStep}>
                                    Next
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Blotter'}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
