import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Building2,
    Hash,
    ImagePlus,
    Mail,
    MapPin,
    Phone,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type BarangayForm = {
    id: number;
    code: string;
    name: string;
    municipality: string | null;
    province: string | null;
    region: string | null;
    address: string | null;
    contact_number: string | null;
    email: string | null;
    is_active: boolean;
    logo_url: string | null;
};

type Stats = {
    residents_count: number;
    puroks_count: number;
    current_officials_count: number;
};

type Props = {
    barangay: BarangayForm;
    stats: Stats;
    can: { update: boolean; delete: boolean };
};

function FieldIcon({ children }: { children: React.ReactNode }) {
    return (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {children}
        </span>
    );
}

export default function BarangaysEdit({ barangay, stats, can }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [logoName, setLogoName] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Barangay management', href: '/management/barangays' },
        { title: barangay.name, href: `/management/barangays/${barangay.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={`Edit — ${barangay.name}`} />

            <div className="flex flex-col gap-6">
                {flash?.status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200">
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="outline" size="sm" asChild className="w-fit gap-2">
                        <Link href="/management/barangays">
                            <ArrowLeft className="h-4 w-4" />
                            All barangays
                        </Link>
                    </Button>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={`/management/barangays/${barangay.id}/officials`}>
                                <UsersRound className="mr-2 h-4 w-4" />
                                Officials
                            </Link>
                        </Button>
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={`/management/barangays/${barangay.id}/puroks`}>
                                <Building2 className="mr-2 h-4 w-4" />
                                Puroks
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 rounded-xl border border-sidebar-border/70 bg-muted/20 p-4 sm:grid-cols-3 dark:border-sidebar-border">
                    <div>
                        <p className="text-xs font-medium uppercase text-muted-foreground">Residents</p>
                        <p className="text-2xl font-semibold tabular-nums">{stats.residents_count}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-muted-foreground">Puroks</p>
                        <p className="text-2xl font-semibold tabular-nums">{stats.puroks_count}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-muted-foreground">Current officials</p>
                        <p className="text-2xl font-semibold tabular-nums">{stats.current_officials_count}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/60 bg-muted/40">
                        {barangay.logo_url ? (
                            <img src={barangay.logo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Edit barangay</h1>
                        <p className="text-xs text-muted-foreground">{barangay.code}</p>
                    </div>
                </div>

                <Form
                    action={`/management/barangays/${barangay.id}`}
                    method="post"
                    encType="multipart/form-data"
                    className="max-w-3xl"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="put" />
                            <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                                <div className="border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Details
                                    </p>
                                </div>
                                <fieldset disabled={!can.update} className="grid gap-5 p-5 sm:grid-cols-2">
                                    <div className="grid gap-1.5 sm:col-span-2">
                                        <Label htmlFor="name">
                                            Barangay name <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <FieldIcon>
                                                <Building2 className="h-4 w-4" />
                                            </FieldIcon>
                                            <Input
                                                id="name"
                                                name="name"
                                                required
                                                className="pl-9"
                                                defaultValue={barangay.name}
                                            />
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
                                            <Input
                                                id="code"
                                                name="code"
                                                required
                                                className="pl-9"
                                                defaultValue={barangay.code}
                                            />
                                        </div>
                                        <InputError message={errors.code} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="is_active">Status</Label>
                                        <select
                                            id="is_active"
                                            name="is_active"
                                            defaultValue={barangay.is_active ? '1' : '0'}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="municipality">Municipality</Label>
                                        <Input
                                            id="municipality"
                                            name="municipality"
                                            defaultValue={barangay.municipality ?? ''}
                                        />
                                        <InputError message={errors.municipality} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="province">Province</Label>
                                        <Input id="province" name="province" defaultValue={barangay.province ?? ''} />
                                        <InputError message={errors.province} />
                                    </div>
                                    <div className="grid gap-1.5 sm:col-span-2">
                                        <Label htmlFor="region">Region</Label>
                                        <Input id="region" name="region" defaultValue={barangay.region ?? ''} />
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
                                                defaultValue={barangay.address ?? ''}
                                                className="flex min-h-[72px] w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                            <Input
                                                id="contact_number"
                                                name="contact_number"
                                                className="pl-9"
                                                defaultValue={barangay.contact_number ?? ''}
                                            />
                                        </div>
                                        <InputError message={errors.contact_number} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <FieldIcon>
                                                <Mail className="h-4 w-4" />
                                            </FieldIcon>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                className="pl-9"
                                                defaultValue={barangay.email ?? ''}
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-1.5 sm:col-span-2">
                                        <Label htmlFor="logo">Replace logo</Label>
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-4 py-3 text-sm hover:bg-muted/40">
                                            <ImagePlus className="h-4 w-4" />
                                            <span>{logoName || 'Choose new image…'}</span>
                                            <input
                                                id="logo"
                                                name="logo"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? '')}
                                            />
                                        </label>
                                        <InputError message={errors.logo} />
                                    </div>
                                </fieldset>

                                <div className="flex flex-wrap justify-end gap-2 border-t border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                                    {can.update && (
                                        <Button type="submit" disabled={processing}>
                                            Save changes
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Form>

                {can.delete && (
                    <div className="max-w-3xl rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                                <div>
                                    <p className="font-medium text-destructive">Delete barangay</p>
                                    <p className="text-sm text-muted-foreground">
                                        Removes this barangay and related puroks and official records. This cannot be
                                        undone.
                                    </p>
                                </div>
                            </div>
                            <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
                                Delete
                            </Button>
                        </div>
                    </div>
                )}

                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this barangay?</AlertDialogTitle>
                            <AlertDialogDescription>
                                All puroks and officials linked to this barangay will be removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Form
                                action={`/management/barangays/${barangay.id}`}
                                method="post"
                                className="inline"
                                onSuccess={() => setDeleteOpen(false)}
                            >
                                <input type="hidden" name="_method" value="delete" />
                                <AlertDialogAction asChild>
                                    <button type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete permanently
                                    </button>
                                </AlertDialogAction>
                            </Form>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
