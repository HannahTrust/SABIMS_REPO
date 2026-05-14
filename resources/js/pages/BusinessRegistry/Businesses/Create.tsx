import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Props = {
    barangay: { id: number; name: string } | null;
    barangays: { id: number; name: string; code: string }[];
    categories: { id: number; name: string; code: string }[];
    puroks: { id: number; name: string }[];
    residents: { id: number; first_name: string; middle_name: string | null; last_name: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Business Registry', href: '/business-registry/dashboard' },
    { title: 'Directory', href: '/business-registry/businesses' },
    { title: 'Register', href: '#' },
];

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

type OwnerRow = { full_name: string; contact_number: string; email: string; resident_id: string; ownership_percentage: string };

export default function BusinessCreate({ barangay, barangays, categories, puroks, residents }: Props) {
    const [owners, setOwners] = useState<OwnerRow[]>([]);

    if (barangay === null) {
        return (
            <AppLayout breadcrumbs={breadcrumbs} contentWide>
                <Head title="Register business" />

                <div className="mx-auto max-w-lg space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Register business</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Choose the barangay where this business will be registered.
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/business-registry/dashboard">Back</Link>
                        </Button>
                    </div>

                    <div className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                        <div className="space-y-2">
                            <Label htmlFor="pick_barangay">Barangay</Label>
                            <select
                                id="pick_barangay"
                                className={selectClass}
                                defaultValue=""
                                onChange={(e) => {
                                    const id = e.target.value;
                                    if (id) {
                                        router.get('/business-registry/businesses/create', {
                                            barangay_id: Number(id),
                                        });
                                    }
                                }}
                            >
                                <option value="">Select a barangay…</option>
                                {barangays.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Super admins must attach each business to a barangay. After you pick one, the full registration
                            form will load.
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    function addOwner() {
        setOwners((o) => [...o, { full_name: '', contact_number: '', email: '', resident_id: '', ownership_percentage: '' }]);
    }

    function removeOwner(i: number) {
        setOwners((o) => o.filter((_, idx) => idx !== i));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Register business" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Register business</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{barangay.name}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/business-registry/businesses">Cancel</Link>
                    </Button>
                </div>

                <Form
                    action="/business-registry/businesses"
                    method="post"
                    encType="multipart/form-data"
                    className="space-y-8"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="barangay_id" value={barangay.id} />

                            <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                                <h2 className="text-sm font-semibold text-foreground">Business information</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="business_name">Business name *</Label>
                                        <Input id="business_name" name="business_name" required />
                                        <InputError message={errors.business_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="business_category_id">Category *</Label>
                                        <select
                                            id="business_category_id"
                                            name="business_category_id"
                                            required
                                            className={selectClass}
                                        >
                                            <option value="">Select…</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.business_category_id} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="business_type">Business type *</Label>
                                        <select id="business_type" name="business_type" required className={selectClass}>
                                            <option value="single_proprietorship">Single proprietorship</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="corporation">Corporation</option>
                                        </select>
                                        <InputError message={errors.business_type} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Address *</Label>
                                        <Input id="address" name="address" required />
                                        <InputError message={errors.address} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="business_description">Description</Label>
                                        <textarea
                                            id="business_description"
                                            name="business_description"
                                            rows={3}
                                            className={selectClass + ' min-h-[80px]'}
                                        />
                                        <InputError message={errors.business_description} />
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
                                    <div className="space-y-2">
                                        <Label htmlFor="date_started">Date started *</Label>
                                        <Input id="date_started" type="date" name="date_started" required />
                                        <InputError message={errors.date_started} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Initial status</Label>
                                        <select id="status" name="status" className={selectClass} defaultValue="pending">
                                            <option value="pending">Pending</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="monthly_income_estimate">Monthly income estimate</Label>
                                        <Input id="monthly_income_estimate" type="number" step="0.01" name="monthly_income_estimate" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="logo">Logo</Label>
                                        <Input id="logo" type="file" name="logo" accept="image/*" />
                                        <InputError message={errors.logo} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                                <h2 className="text-sm font-semibold text-foreground">Primary owner</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="owner_resident_id">Link to resident (optional)</Label>
                                        <select id="owner_resident_id" name="owner_resident_id" className={selectClass}>
                                            <option value="">— Not linked —</option>
                                            {residents.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {[r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="owner_name">Owner name *</Label>
                                        <Input id="owner_name" name="owner_name" required />
                                        <InputError message={errors.owner_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="owner_contact">Contact *</Label>
                                        <Input id="owner_contact" name="owner_contact" required />
                                        <InputError message={errors.owner_contact} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="owner_email">Email</Label>
                                        <Input id="owner_email" type="email" name="owner_email" />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                                <h2 className="text-sm font-semibold text-foreground">Additional owners</h2>
                                {owners.map((row, i) => (
                                    <div key={i} className="grid gap-3 rounded-lg border border-dashed p-4 md:grid-cols-2">
                                        <input type="hidden" name={`additional_owners[${i}][full_name]`} value={row.full_name} />
                                        <input type="hidden" name={`additional_owners[${i}][contact_number]`} value={row.contact_number} />
                                        <input type="hidden" name={`additional_owners[${i}][email]`} value={row.email} />
                                        <input type="hidden" name={`additional_owners[${i}][resident_id]`} value={row.resident_id} />
                                        <input
                                            type="hidden"
                                            name={`additional_owners[${i}][ownership_percentage]`}
                                            value={row.ownership_percentage}
                                        />
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Full name *</Label>
                                            <Input
                                                value={row.full_name}
                                                onChange={(e) =>
                                                    setOwners((list) =>
                                                        list.map((x, j) => (j === i ? { ...x, full_name: e.target.value } : x)),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contact *</Label>
                                            <Input
                                                value={row.contact_number}
                                                onChange={(e) =>
                                                    setOwners((list) =>
                                                        list.map((x, j) =>
                                                            j === i ? { ...x, contact_number: e.target.value } : x,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                value={row.email}
                                                onChange={(e) =>
                                                    setOwners((list) =>
                                                        list.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Resident ID</Label>
                                            <select
                                                className={selectClass}
                                                value={row.resident_id}
                                                onChange={(e) =>
                                                    setOwners((list) =>
                                                        list.map((x, j) =>
                                                            j === i ? { ...x, resident_id: e.target.value } : x,
                                                        ),
                                                    )
                                                }
                                            >
                                                <option value="">—</option>
                                                {residents.map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {[r.first_name, r.last_name].join(' ')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ownership %</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={row.ownership_percentage}
                                                onChange={(e) =>
                                                    setOwners((list) =>
                                                        list.map((x, j) =>
                                                            j === i ? { ...x, ownership_percentage: e.target.value } : x,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeOwner(i)}>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addOwner}>
                                    Add co-owner
                                </Button>
                            </section>

                            <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                                <h2 className="text-sm font-semibold text-foreground">Permit information</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="permit_number">Permit number</Label>
                                        <Input id="permit_number" name="permit_number" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="permit_issue_date">Issue date</Label>
                                        <Input id="permit_issue_date" type="date" name="permit_issue_date" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="permit_expiration_date">Expiration date</Label>
                                        <Input id="permit_expiration_date" type="date" name="permit_expiration_date" />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                                <h2 className="text-sm font-semibold text-foreground">Location mapping (optional)</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input id="latitude" name="latitude" step="any" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input id="longitude" name="longitude" step="any" />
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    Save business
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
