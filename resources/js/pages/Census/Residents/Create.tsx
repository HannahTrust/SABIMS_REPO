import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Props = {
    barangay: { id: number; name: string };
    barangays: { id: number; name: string }[];
    puroks: { id: number; name: string }[];
    households: { id: number; household_code: string; purok_id: number }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Population', href: '/residents/dashboard' },
    { title: 'Residents', href: '/residents' },
    { title: 'Add', href: '/residents/create' },
];

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function ResidentsCreate({ barangay, barangays, puroks, households }: Props) {
    const showBarangayPicker = barangays.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Add resident" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Add resident</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{barangay.name}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/residents">Cancel</Link>
                    </Button>
                </div>

                <Form
                    action="/residents"
                    method="post"
                    className="space-y-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
                >
                    {({ processing, errors }) => (
                        <>
                            {showBarangayPicker && (
                                <div className="space-y-2">
                                    <Label htmlFor="barangay_id">Barangay *</Label>
                                    <select
                                        id="barangay_id"
                                        name="barangay_id"
                                        required
                                        className={selectClass}
                                        defaultValue={barangay.id}
                                    >
                                        {barangays.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.barangay_id} />
                                </div>
                            )}

                            {!showBarangayPicker && (
                                <input type="hidden" name="barangay_id" value={barangay.id} />
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First name *</Label>
                                    <Input id="first_name" name="first_name" required />
                                    <InputError message={errors.first_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middle_name">Middle name</Label>
                                    <Input id="middle_name" name="middle_name" />
                                    <InputError message={errors.middle_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last name *</Label>
                                    <Input id="last_name" name="last_name" required />
                                    <InputError message={errors.last_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="suffix">Suffix</Label>
                                    <Input id="suffix" name="suffix" />
                                    <InputError message={errors.suffix} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">Birth date *</Label>
                                    <Input id="birth_date" type="date" name="birth_date" required />
                                    <InputError message={errors.birth_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender *</Label>
                                    <select id="gender" name="gender" required className={selectClass}>
                                        <option value="">Select…</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <InputError message={errors.gender} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="civil_status">Civil status *</Label>
                                    <Input id="civil_status" name="civil_status" required />
                                    <InputError message={errors.civil_status} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purok_id">Purok *</Label>
                                    <select id="purok_id" name="purok_id" required className={selectClass}>
                                        <option value="">Select…</option>
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
                                <Label htmlFor="household_id">Household (optional)</Label>
                                <select id="household_id" name="household_id" className={selectClass}>
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
                                    <Input id="contact_number" name="contact_number" />
                                    <InputError message={errors.contact_number} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="occupation">Occupation</Label>
                                    <Input id="occupation" name="occupation" />
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
                                        defaultValue="0"
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
                                        defaultValue="0"
                                    >
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                    <InputError message={errors.senior_citizen} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pwd_status">PWD</Label>
                                    <select id="pwd_status" name="pwd_status" className={selectClass} defaultValue="0">
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                    <InputError message={errors.pwd_status} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Record status *</Label>
                                <select id="status" name="status" required className={selectClass} defaultValue="active">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="deceased">Deceased</option>
                                    <option value="transferred">Transferred</option>
                                </select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    Save resident
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
