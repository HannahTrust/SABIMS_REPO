import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Trash2, User } from 'lucide-react';
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

type PurokRow = {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    is_active: boolean;
    residents_count: number;
    leader: { id: number; name: string; role: string } | null;
    purok_leader_user_id: number | null;
};

type LeaderCandidate = { id: number; name: string; role: string };

type BarangayRef = { id: number; name: string; code: string };

type Props = {
    barangay: BarangayRef;
    puroks: PurokRow[];
    leaderCandidates: LeaderCandidate[];
    can: { create: boolean; update: boolean; delete: boolean };
};

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function PuroksPage({ barangay, puroks, leaderCandidates, can }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [createOpen, setCreateOpen] = useState(false);
    const [edit, setEdit] = useState<PurokRow | null>(null);
    const [toDelete, setToDelete] = useState<PurokRow | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Barangay management', href: '/management/barangays' },
        { title: barangay.name, href: `/management/barangays/${barangay.id}/edit` },
        { title: 'Puroks', href: `/management/barangays/${barangay.id}/puroks` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={`Puroks — ${barangay.name}`} />

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
                            Add purok
                        </Button>
                    )}
                </div>

                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Puroks</h1>
                    <p className="text-sm text-muted-foreground">
                        {barangay.name} <span className="text-xs">({barangay.code})</span>
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Purok</th>
                                    <th className="px-4 py-3">Leader</th>
                                    <th className="px-4 py-3 text-center">Residents</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/60">
                                {puroks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                            No puroks yet. {can.create ? 'Add the first purok for this barangay.' : ''}
                                        </td>
                                    </tr>
                                ) : (
                                    puroks.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{p.name}</div>
                                                {p.code && (
                                                    <div className="text-xs text-muted-foreground">Code: {p.code}</div>
                                                )}
                                                {p.description && (
                                                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                        {p.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.leader ? (
                                                    <span className="inline-flex items-center gap-1.5 text-sm">
                                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {p.leader.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center tabular-nums">{p.residents_count}</td>
                                            <td className="px-4 py-3">
                                                {p.is_active ? (
                                                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {can.update && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setEdit(p)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {can.delete && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive"
                                                            onClick={() => setToDelete(p)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>New purok</DialogTitle>
                        <DialogDescription>Names must be unique within this barangay.</DialogDescription>
                    </DialogHeader>
                    <Form
                        action={`/management/barangays/${barangay.id}/puroks`}
                        method="post"
                        className="space-y-4"
                        onSuccess={() => setCreateOpen(false)}
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="create_name">Name *</Label>
                                    <Input id="create_name" name="name" required autoComplete="off" />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_code">Code</Label>
                                    <Input id="create_code" name="code" autoComplete="off" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_description">Description</Label>
                                    <textarea
                                        id="create_description"
                                        name="description"
                                        rows={2}
                                        className="flex min-h-[64px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_leader">Purok leader (user)</Label>
                                    <select
                                        id="create_leader"
                                        name="purok_leader_user_id"
                                        className={selectClass}
                                        defaultValue=""
                                    >
                                        <option value="">— None —</option>
                                        {leaderCandidates.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_active">Status</Label>
                                    <select id="create_active" name="is_active" className={selectClass} defaultValue="1">
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>
                                <DialogFooter className="gap-2">
                                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={edit !== null} onOpenChange={(o) => !o && setEdit(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit purok</DialogTitle>
                    </DialogHeader>
                    {edit && (
                        <Form
                            action={`/management/barangays/${barangay.id}/puroks/${edit.id}`}
                            method="post"
                            className="space-y-4"
                            onSuccess={() => setEdit(null)}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input type="hidden" name="_method" value="put" />
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_name">Name *</Label>
                                        <Input
                                            id="edit_name"
                                            name="name"
                                            required
                                            defaultValue={edit.name}
                                            autoComplete="off"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_code">Code</Label>
                                        <Input id="edit_code" name="code" defaultValue={edit.code ?? ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_description">Description</Label>
                                        <textarea
                                            id="edit_description"
                                            name="description"
                                            rows={2}
                                            defaultValue={edit.description ?? ''}
                                            className="flex min-h-[64px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_leader">Purok leader</Label>
                                        <select
                                            id="edit_leader"
                                            name="purok_leader_user_id"
                                            className={selectClass}
                                            defaultValue={edit.purok_leader_user_id ?? ''}
                                        >
                                            <option value="">— None —</option>
                                            {leaderCandidates.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name} ({u.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_active">Status</Label>
                                        <select
                                            id="edit_active"
                                            name="is_active"
                                            className={selectClass}
                                            defaultValue={edit.is_active ? '1' : '0'}
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
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

            <AlertDialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this purok?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {toDelete ? (
                                <span>
                                    <strong>{toDelete.name}</strong> will be removed. Resident links to this purok may
                                    need to be updated separately.
                                </span>
                            ) : null}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        {toDelete && (
                            <Form
                                action={`/management/barangays/${barangay.id}/puroks/${toDelete.id}`}
                                method="post"
                                onSuccess={() => setToDelete(null)}
                            >
                                <input type="hidden" name="_method" value="delete" />
                                <AlertDialogAction asChild>
                                    <button
                                        type="submit"
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </button>
                                </AlertDialogAction>
                            </Form>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
