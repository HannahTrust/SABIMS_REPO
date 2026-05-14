import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Resident = {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    birth_date: string | null;
    gender: string;
    civil_status: string;
    nationality: string | null;
    contact_number: string | null;
    occupation: string | null;
    voter_status: boolean;
    senior_citizen: boolean;
    pwd_status: boolean;
    status: string;
    purok_id: number;
    household_id: number | null;
};

type Props = {
    barangay: { id: number; name: string };
    resident: Resident;
    puroks: { id: number; name: string }[];
    households: { id: number; household_code: string; purok_id: number }[];
};

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function ResidentsEdit({ barangay, resident, puroks, households }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Population', href: '/residents/dashboard' },
        { title: 'Residents', href: '/residents' },
        { title: 'Edit', href: `/residents/${resident.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Edit resident" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Edit resident</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{barangay.name}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/residents">Back</Link>
                    </Button>
                </div>

                <Form
                    action={`/residents/${resident.id}`}
                    method="post"
                    className="space-y-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="put" />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First name *</Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        required
                                        defaultValue={resident.first_name}
                                    />
                                    <InputError message={errors.first_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middle_name">Middle name</Label>
                                    <Input
                                        id="middle_name"
                                        name="middle_name"
                                        defaultValue={resident.middle_name ?? ''}
                                    />
                                    <InputError message={errors.middle_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last name *</Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        required
                                        defaultValue={resident.last_name}
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="suffix">Suffix</Label>
                                    <Input id="suffix" name="suffix" defaultValue={resident.suffix ?? ''} />
                                    <InputError message={errors.suffix} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">Birth date *</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        name="birth_date"
                                        required
                                        defaultValue={resident.birth_date?.slice(0, 10) ?? ''}
                                    />
                                    <InputError message={errors.birth_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender *</Label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        required
                                        className={selectClass}
                                        defaultValue={resident.gender}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <InputError message={errors.gender} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="civil_status">Civil status *</Label>
                                    <Input
                                        id="civil_status"
                                        name="civil_status"
                                        required
                                        defaultValue={resident.civil_status}
                                    />
                                    <InputError message={errors.civil_status} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purok_id">Purok *</Label>
                                    <select
                                        id="purok_id"
                                        name="purok_id"
                                        required
                                        className={selectClass}
                                        defaultValue={resident.purok_id}
                                    >
                                        {puroks.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.purok_id} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="household_id">Household</Label>
                                <select
                                    id="household_id"
                                    name="household_id"
                                    className={selectClass}
                                    defaultValue={resident.household_id ?? ''}
                                >
                                    <option value="">— None —</option>
                                    {households.map((h) => (
                                        <option key={h.id} value={h.id}>
                                            {h.household_code}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.household_id} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_number">Contact number</Label>
                                    <Input
                                        id="contact_number"
                                        name="contact_number"
                                        defaultValue={resident.contact_number ?? ''}
                                    />
                                    <InputError message={errors.contact_number} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="occupation">Occupation</Label>
                                    <Input
                                        id="occupation"
                                        name="occupation"
                                        defaultValue={resident.occupation ?? ''}
                                    />
                                    <InputError message={errors.occupation} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="voter_status">Registered voter</Label>
                                    <select
                                        id="voter_status"
                                        name="voter_status"
                                        className={selectClass}
                                        defaultValue={resident.voter_status ? '1' : '0'}
                                    >
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                    <InputError message={errors.voter_status} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="senior_citizen">Senior citizen</Label>
                                    <select
                                        id="senior_citizen"
                                        name="senior_citizen"
                                        className={selectClass}
                                        defaultValue={resident.senior_citizen ? '1' : '0'}
                                    >
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                    <InputError message={errors.senior_citizen} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pwd_status">PWD</Label>
                                    <select
                                        id="pwd_status"
                                        name="pwd_status"
                                        className={selectClass}
                                        defaultValue={resident.pwd_status ? '1' : '0'}
                                    >
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                    <InputError message={errors.pwd_status} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Record status *</Label>
                                <select
                                    id="status"
                                    name="status"
                                    required
                                    className={selectClass}
                                    defaultValue={resident.status}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="deceased">Deceased</option>
                                    <option value="transferred">Transferred</option>
                                </select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="flex flex-wrap justify-between gap-4">
                                <Button type="submit" disabled={processing}>
                                    Save changes
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <Form
                    action={`/residents/${resident.id}/archive`}
                    method="post"
                    className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20"
                >
                    {({ processing }) => (
                        <>
                            <input type="hidden" name="_method" value="patch" />
                            <p className="mb-3 text-sm text-muted-foreground">
                                Archive sets status to inactive (soft administrative archive).
                            </p>
                            <Button type="submit" variant="destructive" size="sm" disabled={processing}>
                                Archive resident
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
