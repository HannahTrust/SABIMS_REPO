import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, Hash, ImagePlus, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Barangay management', href: '/management/barangays' },
    { title: 'Create', href: '/management/barangays/create' },
];

function FieldIcon({ children }: { children: React.ReactNode }) {
    return (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {children}
        </span>
    );
}

export default function BarangaysCreate() {
    const [logoName, setLogoName] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Create barangay" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild className="gap-2">
                            <Link href="/management/barangays">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Create barangay</h1>
                        <p className="text-xs text-muted-foreground">Register master data for use across eBarangayHub.</p>
                    </div>
                </div>

                <Form
                    action="/management/barangays"
                    method="post"
                    encType="multipart/form-data"
                    className="max-w-3xl"
                >
                    {({ processing, errors }) => (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                            <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Identity &amp; location
                                </p>
                            </div>
                            <div className="grid gap-5 p-5 sm:grid-cols-2">
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="name">
                                        Barangay name <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Building2 className="h-4 w-4" />
                                        </FieldIcon>
                                        <Input id="name" name="name" required className="pl-9" autoComplete="off" />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="code">
                                        Code <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Hash className="h-4 w-4" />
                                        </FieldIcon>
                                        <Input id="code" name="code" required className="pl-9" placeholder="e.g. B-01" />
                                    </div>
                                    <InputError message={errors.code} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="is_active">Status</Label>
                                    <select
                                        id="is_active"
                                        name="is_active"
                                        defaultValue="1"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                    <InputError message={errors.is_active} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="municipality">Municipality</Label>
                                    <Input id="municipality" name="municipality" autoComplete="off" />
                                    <InputError message={errors.municipality} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="province">Province</Label>
                                    <Input id="province" name="province" autoComplete="off" />
                                    <InputError message={errors.province} />
                                </div>
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="region">Region</Label>
                                    <Input id="region" name="region" autoComplete="off" />
                                    <InputError message={errors.region} />
                                </div>

                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <MapPin className="h-4 w-4" />
                                        </FieldIcon>
                                        <textarea
                                            id="address"
                                            name="address"
                                            rows={2}
                                            className="flex min-h-[72px] w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="contact_number">Contact number</Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Phone className="h-4 w-4" />
                                        </FieldIcon>
                                        <Input id="contact_number" name="contact_number" className="pl-9" />
                                    </div>
                                    <InputError message={errors.contact_number} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <FieldIcon>
                                            <Mail className="h-4 w-4" />
                                        </FieldIcon>
                                        <Input id="email" name="email" type="email" className="pl-9" />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="logo">Logo</Label>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-4 py-3 text-sm hover:bg-muted/40">
                                            <ImagePlus className="h-4 w-4" />
                                            <span>{logoName || 'Choose image…'}</span>
                                            <input
                                                id="logo"
                                                name="logo"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? '')}
                                            />
                                        </label>
                                    </div>
                                    <InputError message={errors.logo} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/management/barangays">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create barangay
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
