import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Owner = {
    id?: number;
    resident_id: number | null;
    full_name: string;
    contact_number: string;
    email: string | null;
    ownership_percentage: number | null;
};

type Business = {
    id: number;
    business_name: string;
    business_category_id: number;
    business_type: string;
    address: string;
    business_description: string | null;
    purok_id: number;
    date_started: string;
    status: string;
    monthly_income_estimate: string | null;
    owner_resident_id: number | null;
    owner_name: string;
    owner_contact: string;
    owner_email: string | null;
    permit_number: string | null;
    permit_issue_date: string | null;
    permit_expiration_date: string | null;
    latitude: string | null;
    longitude: string | null;
    remarks: string | null;
    owners: Owner[];
};

type Props = {
    barangay: { id: number; name: string };
    business: Business;
    categories: { id: number; name: string; code: string }[];
    puroks: { id: number; name: string }[];
    residents: { id: number; first_name: string; middle_name: string | null; last_name: string }[];
};

const breadcrumbsFor = (id: number): BreadcrumbItem[] => [
    { title: 'Business Registry', href: '/business-registry/dashboard' },
    { title: 'Directory', href: '/business-registry/businesses' },
    { title: 'Edit', href: `/business-registry/businesses/${id}/edit` },
];

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

type OwnerRow = { full_name: string; contact_number: string; email: string; resident_id: string; ownership_percentage: string };

export default function BusinessEdit({ barangay, business, categories, puroks, residents }: Props) {
    const [owners, setOwners] = useState<OwnerRow[]>(() =>
        (business.owners ?? []).map((o) => ({
            full_name: o.full_name,
            contact_number: o.contact_number,
            email: o.email ?? '',
            resident_id: o.resident_id ? String(o.resident_id) : '',
            ownership_percentage: o.ownership_percentage != null ? String(o.ownership_percentage) : '',
        })),
    );

    function addOwner() {
        setOwners((o) => [...o, { full_name: '', contact_number: '', email: '', resident_id: '', ownership_percentage: '' }]);
    }

    function removeOwner(i: number) {
        setOwners((o) => o.filter((_, idx) => idx !== i));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbsFor(business.id)} contentWide>
            <Head title={`Edit ${business.business_name}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Edit business</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{barangay.name}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/business-registry/businesses/${business.id}`}>Cancel</Link>
                    </Button>
                </div>

                <Form
                    action={`/business-registry/businesses/${business.id}`}
                    method="post"
                    encType="multipart/form-data"
                    className="space-y-8"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="put" />

                            <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                                <h2 className="text-sm font-semibold text-foreground">Business information</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="business_name">Business name *</Label>
                                        <Input
                                            id="business_name"
                                            name="business_name"
                                            required
                                            defaultValue={business.business_name}
                                        />
                                        <InputError message={errors.business_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="business_category_id">Category *</Label>
                                        <select
                                            id="business_category_id"
                                            name="business_category_id"
                                            required
                                            className={selectClass}
                                            defaultValue={business.business_category_id}
                                        >
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="business_type">Business type *</Label>
                                        <select
                                            id="business_type"
                                            name="business_type"
                                            required
                                            className={selectClass}
                                            defaultValue={business.business_type}
                                        >
                                            <option value="single_proprietorship">Single proprietorship</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="corporation">Corporation</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Address *</Label>
                                        <Input id="address" name="address" required defaultValue={business.address} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="business_description">Description</Label>
                                        <textarea
                                            id="business_description"
                                            name="business_description"
                                            rows={3}
                                            defaultValue={business.business_description ?? ''}
                                            className={selectClass + ' min-h-[80px]'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purok_id">Purok *</Label>
                                        <select
                                            id="purok_id"
                                            name="purok_id"
                                            required
                                            className={selectClass}
                                            defaultValue={business.purok_id}
                                        >
                                            {puroks.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_started">Date started *</Label>
                                        <Input
                                            id="date_started"
                                            type="date"
                                            name="date_started"
                                            required
                                            defaultValue={business.date_started?.slice(0, 10)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            name="status"
                                            className={selectClass}
                                            defaultValue={business.status}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="monthly_income_estimate">Monthly income estimate</Label>
                                        <Input
                                            id="monthly_income_estimate"
                                            type="number"
                                            step="0.01"
                                            name="monthly_income_estimate"
                                            defaultValue={business.monthly_income_estimate ?? ''}
                                        />
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
                                        <Label htmlFor="owner_resident_id">Link to resident</Label>
                                        <select
                                            id="owner_resident_id"
                                            name="owner_resident_id"
                                            className={selectClass}
                                            defaultValue={business.owner_resident_id ?? ''}
                                        >
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
                                        <Input id="owner_name" name="owner_name" required defaultValue={business.owner_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="owner_contact">Contact *</Label>
                                        <Input id="owner_contact" name="owner_contact" required defaultValue={business.owner_contact} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="owner_email">Email</Label>
                                        <Input
                                            id="owner_email"
                                            type="email"
                                            name="owner_email"
                                            defaultValue={business.owner_email ?? ''}
                                        />
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
                                        <Input id="permit_number" name="permit_number" defaultValue={business.permit_number ?? ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="permit_issue_date">Issue date</Label>
                                        <Input
                                            id="permit_issue_date"
                                            type="date"
                                            name="permit_issue_date"
                                            defaultValue={business.permit_issue_date?.slice(0, 10) ?? ''}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="permit_expiration_date">Expiration date</Label>
                                        <Input
                                            id="permit_expiration_date"
                                            type="date"
                                            name="permit_expiration_date"
                                            defaultValue={business.permit_expiration_date?.slice(0, 10) ?? ''}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                                <h2 className="text-sm font-semibold text-foreground">Location mapping</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            name="latitude"
                                            step="any"
                                            defaultValue={business.latitude ?? ''}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            name="longitude"
                                            step="any"
                                            defaultValue={business.longitude ?? ''}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                                <h2 className="text-sm font-semibold text-foreground">Remarks</h2>
                                <textarea
                                    id="remarks"
                                    name="remarks"
                                    rows={3}
                                    defaultValue={business.remarks ?? ''}
                                    className={selectClass + ' min-h-[80px]'}
                                />
                            </section>

                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    Save changes
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
