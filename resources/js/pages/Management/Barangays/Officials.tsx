import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Camera,
    FileSignature,
    Pencil,
    Plus,
    UserCheck,
    UserMinus,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Position = { id: number; name: string; code: string; hierarchy_level: number };

type OfficialRow = {
    id: number;
    full_name: string;
    contact_number: string | null;
    email: string | null;
    term_start: string | null;
    term_end: string | null;
    is_current: boolean;
    official_position_id: number;
    position: { id: number; name: string; code: string } | null;
    resident_id: number | null;
    resident: { id: number; name: string } | null;
    user_id: number | null;
    linked_user: { id: number; name: string } | null;
    photo_url: string | null;
    signature_url: string | null;
};

type LinkOption = { id: number; name: string; email: string | null; role?: string };

type BarangayRef = { id: number; name: string; code: string };

type Props = {
    barangay: BarangayRef;
    positions: Position[];
    currentOfficials: OfficialRow[];
    pastOfficials: OfficialRow[];
    residentLinks: LinkOption[];
    accountLinks: LinkOption[];
    can: { create: boolean; update: boolean; assign: boolean };
};

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function OfficialsPage({
    barangay,
    positions,
    currentOfficials,
    pastOfficials,
    residentLinks,
    accountLinks,
    can,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [createOpen, setCreateOpen] = useState(false);
    const [edit, setEdit] = useState<OfficialRow | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Barangay management', href: '/management/barangays' },
        { title: barangay.name, href: `/management/barangays/${barangay.id}/edit` },
        { title: 'Officials', href: `/management/barangays/${barangay.id}/officials` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={`Officials — ${barangay.name}`} />

            <div className="flex flex-col gap-6">
                {flash?.status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200">
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="gap-2">
                            <Link href={`/management/barangays/${barangay.id}/edit`}>
                                <ArrowLeft className="h-4 w-4" />
                                Barangay
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/management/barangays">All barangays</Link>
                        </Button>
                    </div>
                    {can.create && (
                        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Add official
                        </Button>
                    )}
                </div>

                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Barangay officials</h1>
                    <p className="text-sm text-muted-foreground">
                        {barangay.name} <span className="text-xs">({barangay.code})</span>
                    </p>
                </div>

                <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Current officials
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[960px] text-sm">
                                <thead className="border-b border-sidebar-border/70 bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Official</th>
                                        <th className="px-4 py-3">Position</th>
                                        <th className="px-4 py-3">Term</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/60">
                                    {currentOfficials.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                                No current officials on record.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentOfficials.map((o) => (
                                            <tr key={o.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-sidebar-border/60 bg-muted/40">
                                                            {o.photo_url ? (
                                                                <img
                                                                    src={o.photo_url}
                                                                    alt=""
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <Camera className="m-auto h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{o.full_name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {o.email ?? o.contact_number ?? '—'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{o.position?.name ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {o.term_start ?? '—'} → {o.term_end ?? 'open'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        {can.update && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 gap-1"
                                                                onClick={() => setEdit(o)}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Edit
                                                            </Button>
                                                        )}
                                                        {can.assign && (
                                                            <>
                                                                <Form
                                                                    action={`/management/barangays/${barangay.id}/officials/${o.id}/end-term`}
                                                                    method="post"
                                                                    className="inline"
                                                                >
                                                                    <Button
                                                                        type="submit"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 gap-1"
                                                                    >
                                                                        <UserMinus className="h-3.5 w-3.5" />
                                                                        End term
                                                                    </Button>
                                                                </Form>
                                                                <Form
                                                                    action={`/management/barangays/${barangay.id}/officials/${o.id}/set-current`}
                                                                    method="post"
                                                                    className="inline"
                                                                >
                                                                    <input type="hidden" name="current" value="0" />
                                                                    <Button type="submit" variant="ghost" size="sm" className="h-8">
                                                                        Not current
                                                                    </Button>
                                                                </Form>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        History &amp; inactive
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[880px] text-sm">
                                <thead className="border-b border-sidebar-border/70 bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Official</th>
                                        <th className="px-4 py-3">Position</th>
                                        <th className="px-4 py-3">Term</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/60">
                                    {pastOfficials.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                                No historical entries yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        pastOfficials.map((o) => (
                                            <tr key={o.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{o.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {o.linked_user && (
                                                            <span>Account: {o.linked_user.name} · </span>
                                                        )}
                                                        {o.resident && <span>Resident: {o.resident.name}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{o.position?.name ?? '—'}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {o.term_start ?? '—'} → {o.term_end ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {can.assign && (
                                                        <Form
                                                            action={`/management/barangays/${barangay.id}/officials/${o.id}/set-current`}
                                                            method="post"
                                                            className="inline"
                                                        >
                                                            <input type="hidden" name="current" value="1" />
                                                            <Button type="submit" variant="outline" size="sm" className="h-8 gap-1">
                                                                <UserCheck className="h-3.5 w-3.5" />
                                                                Set current
                                                            </Button>
                                                        </Form>
                                                    )}
                                                    {can.update && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="ml-1 h-8"
                                                            onClick={() => setEdit(o)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add official</DialogTitle>
                        <DialogDescription>
                            Only one current captain per barangay; uploading a new captain marks others as not current.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        action={`/management/barangays/${barangay.id}/officials`}
                        method="post"
                        encType="multipart/form-data"
                        className="space-y-4"
                        onSuccess={() => setCreateOpen(false)}
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="c_position">Position *</Label>
                                    <select id="c_position" name="official_position_id" required className={selectClass}>
                                        <option value="">Select…</option>
                                        {positions.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.official_position_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c_name">Full name *</Label>
                                    <Input id="c_name" name="full_name" required autoComplete="off" />
                                    <InputError message={errors.full_name} />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="c_term_start">Term start *</Label>
                                        <Input id="c_term_start" name="term_start" type="date" required />
                                        <InputError message={errors.term_start} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="c_term_end">Term end</Label>
                                        <Input id="c_term_end" name="term_end" type="date" />
                                        <InputError message={errors.term_end} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c_current">Current</Label>
                                    <select id="c_current" name="is_current" className={selectClass} defaultValue="1">
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c_resident">Link resident profile</Label>
                                    <select id="c_resident" name="resident_id" className={selectClass} defaultValue="">
                                        <option value="">— None —</option>
                                        {residentLinks.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c_account">Link user account</Label>
                                    <select id="c_account" name="user_id" className={selectClass} defaultValue="">
                                        <option value="">— None —</option>
                                        {accountLinks.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name} ({r.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c_contact">Contact</Label>
                                    <Input id="c_contact" name="contact_number" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c_email">Email</Label>
                                    <Input id="c_email" name="email" type="email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c_photo" className="inline-flex items-center gap-2">
                                        <Camera className="h-4 w-4" /> Photo
                                    </Label>
                                    <Input id="c_photo" name="photo" type="file" accept="image/*" />
                                    <InputError message={errors.photo} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c_sig" className="inline-flex items-center gap-2">
                                        <FileSignature className="h-4 w-4" /> Signature
                                    </Label>
                                    <Input id="c_sig" name="signature" type="file" accept="image/*" />
                                    <InputError message={errors.signature} />
                                </div>
                                <DialogFooter className="gap-2">
                                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Save
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={edit !== null} onOpenChange={(o) => !o && setEdit(null)}>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit official</DialogTitle>
                    </DialogHeader>
                    {edit && (
                        <Form
                            action={`/management/barangays/${barangay.id}/officials/${edit.id}`}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-4"
                            onSuccess={() => setEdit(null)}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input type="hidden" name="_method" value="put" />
                                    <div className="space-y-2">
                                        <Label htmlFor="e_position">Position *</Label>
                                        <select
                                            id="e_position"
                                            name="official_position_id"
                                            required
                                            className={selectClass}
                                            defaultValue={edit.official_position_id}
                                        >
                                            {positions.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.official_position_id} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="e_name">Full name *</Label>
                                        <Input
                                            id="e_name"
                                            name="full_name"
                                            required
                                            defaultValue={edit.full_name}
                                            autoComplete="off"
                                        />
                                        <InputError message={errors.full_name} />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="e_term_start">Term start *</Label>
                                            <Input
                                                id="e_term_start"
                                                name="term_start"
                                                type="date"
                                                required
                                                defaultValue={edit.term_start ?? ''}
                                            />
                                            <InputError message={errors.term_start} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="e_term_end">Term end</Label>
                                            <Input id="e_term_end" name="term_end" type="date" defaultValue={edit.term_end ?? ''} />
                                            <InputError message={errors.term_end} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="e_current">Current</Label>
                                        <select
                                            id="e_current"
                                            name="is_current"
                                            className={selectClass}
                                            defaultValue={edit.is_current ? '1' : '0'}
                                        >
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="e_resident">Link resident profile</Label>
                                        <select
                                            id="e_resident"
                                            name="resident_id"
                                            className={selectClass}
                                            defaultValue={edit.resident_id ?? ''}
                                        >
                                            <option value="">— None —</option>
                                            {residentLinks.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="e_account">Link user account</Label>
                                        <select
                                            id="e_account"
                                            name="user_id"
                                            className={selectClass}
                                            defaultValue={edit.user_id ?? ''}
                                        >
                                            <option value="">— None —</option>
                                            {accountLinks.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.name} ({r.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="e_contact">Contact</Label>
                                        <Input id="e_contact" name="contact_number" defaultValue={edit.contact_number ?? ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="e_email">Email</Label>
                                        <Input id="e_email" name="email" type="email" defaultValue={edit.email ?? ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="e_photo">Replace photo</Label>
                                        <Input id="e_photo" name="photo" type="file" accept="image/*" />
                                        <InputError message={errors.photo} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="e_sig">Replace signature</Label>
                                        <Input id="e_sig" name="signature" type="file" accept="image/*" />
                                        <InputError message={errors.signature} />
                                    </div>
                                    <DialogFooter className="gap-2">
                                        <Button type="button" variant="outline" onClick={() => setEdit(null)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Save
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
