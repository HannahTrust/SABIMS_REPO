import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Search, Shield, Users, Eye, Pencil, UserCheck, UserX } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string | null;
    is_active: boolean;
    created_at: string | null;
};

type Props = {
    users: {
        data: UserRow[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        meta: {
            total: number;
            from: number | null;
            to: number | null;
            current_page: number;
            last_page: number;
        };
    };
    filters?: {
        search?: string;
    };
    allowedRoles: string[];
};

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
    super_admin: {
        label: 'Super Admin',
        className:
            'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    },
    admin: {
        label: 'Admin',
        className:
            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    },
    vice_mayor: {
        label: 'Vice Mayor',
        className:
            'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800',
    },
    sb_secretary: {
        label: 'SB Secretary',
        className:
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    },
    sb_member: {
        label: 'SB Member',
        className:
            'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    },
    brgy_admin: {
        label: 'Barangay Admin',
        className:
            'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:border-fuchsia-800',
    },
    brgy_captain: {
        label: 'Barangay Captain',
        className:
            'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
    },
    brgy_secretary: {
        label: 'Barangay Secretary',
        className:
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    },
    purok_leader: {
        label: 'Purok Leader',
        className:
            'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    },
    resident: {
        label: 'Resident',
        className:
            'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
    },
};

function RoleBadge({ role }: { role: string | null }) {
    const normalized = (role ?? '').toLowerCase();
    const config =
        ROLE_BADGE[normalized] ??
        ({
            label: role ?? '—',
            className:
                'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        } as const);

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                active
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
            }`}
        >
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}

export default function UsersIndex({ users, filters, allowedRoles }: Props) {
    const { flash, auth } = usePage().props as {
        flash?: { status?: string };
        auth: { user: { id: number; role?: string | null } };
    };

    const [viewUser, setViewUser] = useState<UserRow | null>(null);
    const [pendingRoleChange, setPendingRoleChange] = useState<{
        user: UserRow;
        role: string;
    } | null>(null);
    const [pendingStatusChange, setPendingStatusChange] = useState<{
        user: UserRow;
        is_active: boolean;
    } | null>(null);
    const [search, setSearch] = useState(filters?.search ?? '');

    const rolesForDropdown = useMemo(() => {
        // Only super_admin can access this page; keep options clean.
        return allowedRoles;
    }, [allowedRoles]);
    const rows = users?.data ?? [];

    const applySearch = () => {
        router.get(
            '/users',
            { search: search.trim() || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const resetSearch = () => {
        setSearch('');
        router.get('/users', {}, { preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {flash?.status && (
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                        <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-green-500" />
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold leading-tight">User Management</h1>
                            <p className="text-xs text-muted-foreground">
                                Super Admin only • {users?.meta?.total ?? 0} users
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Signed in as{' '}
                        <span className="font-medium">{auth?.user?.role ?? '—'}</span>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        applySearch();
                                    }
                                }}
                                placeholder="Search name, email, or role..."
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" onClick={applySearch}>
                                Search
                            </Button>
                            <Button type="button" variant="outline" onClick={resetSearch}>
                                Reset
                            </Button>
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Showing {users?.meta?.from ?? 0} to {users?.meta?.to ?? 0} of {users?.meta?.total ?? 0} users
                    </p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full table-auto text-left text-sm">
                        <thead>
                            <tr className="border-b border-sidebar-border/70 bg-muted/40 dark:border-sidebar-border">
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                                    Created At
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {rows.map((u) => {
                                const isSelf = auth?.user?.id === u.id;
                                const isSuperAdmin = (u.role ?? '') === 'super_admin';

                                return (
                                    <tr key={u.id} className="group transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium whitespace-nowrap">{u.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground max-w-[240px] truncate">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <RoleBadge role={u.role} />
                                                <select
                                                    className="h-9 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    defaultValue={u.role ?? ''}
                                                    disabled={isSelf || isSuperAdmin}
                                                    onChange={(e) => {
                                                        const next = e.target.value;
                                                        // reset visual back immediately; we confirm via dialog first.
                                                        e.target.value = u.role ?? '';
                                                        setPendingRoleChange({ user: u, role: next });
                                                    }}
                                                >
                                                    {rolesForDropdown.map((r) => (
                                                        <option key={r} value={r}>
                                                            {ROLE_BADGE[r]?.label ?? r}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {(isSelf || isSuperAdmin) && (
                                                <p className="mt-1 text-[11px] text-muted-foreground">
                                                    {isSelf
                                                        ? 'You cannot change your own role.'
                                                        : 'Super admin role is protected.'}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge active={u.is_active} />
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {u.created_at ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1.5"
                                                    onClick={() => setViewUser(u)}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1.5"
                                                    disabled
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Edit
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1.5"
                                                    disabled={isSelf || isSuperAdmin}
                                                    onClick={() =>
                                                        setPendingStatusChange({
                                                            user: u,
                                                            is_active: !u.is_active,
                                                        })
                                                    }
                                                >
                                                    {u.is_active ? (
                                                        <>
                                                            <UserX className="h-3.5 w-3.5" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck className="h-3.5 w-3.5" />
                                                            Activate
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {(users?.links?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-2 px-1 pb-1">
                        {users.links.map((link, index) => (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url ?? '#'}
                                className={`rounded-md border px-3 py-1.5 text-xs ${
                                    link.active
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-sidebar-border/70 hover:bg-muted dark:border-sidebar-border'
                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* View dialog */}
                <AlertDialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>User details</AlertDialogTitle>
                            <AlertDialogDescription>
                                {viewUser ? (
                                    <div className="mt-3 space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Name:</span>{' '}
                                            <span className="font-medium text-foreground">{viewUser.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Email:</span>{' '}
                                            <span className="font-medium text-foreground">{viewUser.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Role:</span>{' '}
                                            <RoleBadge role={viewUser.role} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Status:</span>{' '}
                                            <StatusBadge active={viewUser.is_active} />
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Created:</span>{' '}
                                            <span className="font-medium text-foreground">
                                                {viewUser.created_at ?? '—'}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction asChild>
                                <Button type="button" onClick={() => setViewUser(null)}>
                                    Close
                                </Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Confirm role change */}
                <AlertDialog open={!!pendingRoleChange} onOpenChange={(open) => !open && setPendingRoleChange(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Change role</AlertDialogTitle>
                            <AlertDialogDescription>
                                {pendingRoleChange ? (
                                    <>
                                        You are about to change the role for{' '}
                                        <span className="font-semibold text-foreground">{pendingRoleChange.user.email}</span>{' '}
                                        to <span className="font-semibold text-foreground">{ROLE_BADGE[pendingRoleChange.role]?.label ?? pendingRoleChange.role}</span>.
                                    </>
                                ) : null}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPendingRoleChange(null)}>Cancel</AlertDialogCancel>
                            {pendingRoleChange && (
                                <Form
                                    action={`/users/${pendingRoleChange.user.id}/role`}
                                    method="patch"
                                    className="inline"
                                >
                                    <input type="hidden" name="role" value={pendingRoleChange.role} />
                                    <AlertDialogAction asChild>
                                        <Button type="submit">Confirm</Button>
                                    </AlertDialogAction>
                                </Form>
                            )}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Confirm status change */}
                <AlertDialog
                    open={!!pendingStatusChange}
                    onOpenChange={(open) => !open && setPendingStatusChange(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {pendingStatusChange?.is_active ? 'Activate user' : 'Deactivate user'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {pendingStatusChange ? (
                                    <>
                                        You are about to {pendingStatusChange.is_active ? 'activate' : 'deactivate'}{' '}
                                        <span className="font-semibold text-foreground">{pendingStatusChange.user.email}</span>.
                                    </>
                                ) : null}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPendingStatusChange(null)}>Cancel</AlertDialogCancel>
                            {pendingStatusChange && (
                                <Form
                                    action={`/users/${pendingStatusChange.user.id}/status`}
                                    method="patch"
                                    className="inline"
                                >
                                    <input
                                        type="hidden"
                                        name="is_active"
                                        value={pendingStatusChange.is_active ? '1' : '0'}
                                    />
                                    <AlertDialogAction asChild>
                                        <Button type="submit">Confirm</Button>
                                    </AlertDialogAction>
                                </Form>
                            )}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}

