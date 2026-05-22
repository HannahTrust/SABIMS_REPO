import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { ResidentSearchSelect } from '@/components/incident-report/resident-search-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

const schema = z
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
        attachments: z.array(z.instanceof(File)).max(5, 'Maximum 5 new attachments'),
    })
    .superRefine((values, ctx) => {
        if (values.respondent_mode === 'resident' && (!values.respondent_id || values.respondent_id.trim() === '')) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Respondent resident is required', path: ['respondent_id'] });
        }
        if (values.respondent_mode === 'outsider' && (!values.respondent_name || values.respondent_name.trim() === '')) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Outsider respondent name is required', path: ['respondent_name'] });
        }
    });

type FormValues = z.infer<typeof schema>;
type Option = { id: number; name: string };

type ExistingAttachment = { id: number; file_name: string; file_url: string };

type Report = {
    id: number;
    report_number: string;
    incident_type_id: string;
    complainant_id: string;
    respondent_id: string;
    respondent_name: string | null;
    respondent_mode: 'resident' | 'outsider';
    incident_datetime: string;
    incident_location: string;
    narrative: string;
    action_taken: string | null;
    remarks: string | null;
    assigned_to: string;
    status: FormValues['status'];
    settlement_date: string | null;
    purok_id: string;
    witnesses: Array<{ name: string; contact: string | null; statement: string | null }>;
    attachments: ExistingAttachment[];
};

type Props = {
    report: Report;
    incidentTypes: Option[];
    residents: Option[];
    officers: Option[];
    purokOptions: string[];
};

export default function IncidentReportEdit({ report, incidentTypes, residents, officers, purokOptions }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Incident Reports', href: '/incident-reports' },
        { title: report.report_number, href: `/incident-reports/${report.id}` },
        { title: 'Edit', href: `/incident-reports/${report.id}/edit` },
    ];

    const defaultValues: FormValues = {
        purok_id: report.purok_id,
        incident_type_id: report.incident_type_id,
        incident_datetime: report.incident_datetime,
        incident_location: report.incident_location,
        complainant_id: report.complainant_id,
        respondent_mode: report.respondent_mode,
        respondent_id: report.respondent_id,
        respondent_name: report.respondent_name ?? '',
        narrative: report.narrative,
        action_taken: report.action_taken ?? '',
        remarks: report.remarks ?? '',
        assigned_to: report.assigned_to,
        status: report.status,
        settlement_date: report.settlement_date ?? '',
        witnesses: report.witnesses.map((w) => ({
            name: w.name,
            contact: w.contact ?? '',
            statement: w.statement ?? '',
        })),
        attachments: [],
    };

    const { register, control, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const witnessesFieldArray = useFieldArray({ control, name: 'witnesses' });
    const respondentMode = watch('respondent_mode');
    const complainantId = watch('complainant_id');
    const respondentId = watch('respondent_id');
    const newAttachments = watch('attachments');

    const residentsForRespondent = useMemo(() => {
        if (!complainantId) return residents;
        return residents.filter((r) => String(r.id) !== complainantId);
    }, [residents, complainantId]);

    useEffect(() => {
        if (respondentMode === 'resident' && complainantId && respondentId && complainantId === respondentId) {
            setValue('respondent_id', '', { shouldValidate: true });
        }
    }, [complainantId, respondentId, respondentMode, setValue]);

    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('_method', 'PUT');
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

        router.post(`/incident-reports/${report.id}`, formData, {
            forceFormData: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={`Edit ${report.report_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold leading-tight">Edit Incident Report</h1>
                        <p className="text-xs text-muted-foreground">{report.report_number}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
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
                            <Input {...register('incident_location')} />
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
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Controller
                            name="complainant_id"
                            control={control}
                            render={({ field }) => (
                                <ResidentSearchSelect
                                    id="edit-complainant"
                                    label="Complainant"
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
                                            id="edit-respondent"
                                            label="Respondent Resident"
                                            options={residentsForRespondent}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            error={errors.respondent_id?.message}
                                            required
                                        />
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="grid gap-1.5 md:col-span-2">
                                <Label>Outsider Respondent Name *</Label>
                                <Input {...register('respondent_name')} />
                                <p className="text-xs text-destructive">{errors.respondent_name?.message}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label>Narrative *</Label>
                            <textarea rows={6} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('narrative')} />
                            <p className="text-xs text-destructive">{errors.narrative?.message}</p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Action Taken</Label>
                            <textarea rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('action_taken')} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Remarks</Label>
                            <textarea rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('remarks')} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
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
                                <Label>Settlement Date</Label>
                                <Input type="date" {...register('settlement_date')} />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Witnesses</p>
                            <Button type="button" variant="outline" size="sm" onClick={() => witnessesFieldArray.append({ name: '', contact: '', statement: '' })}>
                                <Plus className="mr-1 h-4 w-4" /> Add Witness
                            </Button>
                        </div>
                        {witnessesFieldArray.fields.map((field, index) => (
                            <div key={field.id} className="grid gap-3 rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">Witness #{index + 1}</p>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => witnessesFieldArray.remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Input placeholder="Name" {...register(`witnesses.${index}.name`)} />
                                    <Input placeholder="Contact" {...register(`witnesses.${index}.contact`)} />
                                </div>
                                <textarea rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Statement" {...register(`witnesses.${index}.statement`)} />
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-4">
                        {report.attachments.length > 0 && (
                            <div className="rounded-lg border p-3">
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Existing attachments</p>
                                <ul className="mt-2 space-y-1 text-sm">
                                    {report.attachments.map((file) => (
                                        <li key={file.id}>
                                            <a href={file.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                {file.file_name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="grid gap-1.5">
                            <Label>Add attachments (PDF/JPG/PNG)</Label>
                            <Input
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setValue('attachments', Array.from(e.target.files ?? []), { shouldValidate: true })}
                            />
                            {newAttachments.length > 0 && (
                                <ul className="text-sm text-muted-foreground">
                                    {newAttachments.map((f, i) => (
                                        <li key={`${f.name}-${i}`} className="flex items-center gap-2">
                                            <Upload className="h-4 w-4" /> {f.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                        <Button type="button" variant="ghost" asChild>
                            <Link href={`/incident-reports/${report.id}`}>
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
