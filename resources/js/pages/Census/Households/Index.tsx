import { Form, Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type HouseholdRow = {
    id: number;
    household_code: string;
    address: string | null;
    members_count: number;
    is_active: boolean;
    purok: { id: number; name: string } | null;
    head: { id: number; first_name: string; last_name: string } | null;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    last_page: number;
};

type Props = {
    barangay: { id: number; name: string };
    households: Paginated<HouseholdRow>;
    puroks: { id: number; name: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Population', href: '/residents/dashboard' },
    { title: 'Households', href: '/residents/households' },
];

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function HouseholdsIndex({ barangay, households, puroks }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Households" />

            <div className="flex flex-col gap-6">
                {flash?.status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200">
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Households</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{barangay.name}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/residents/dashboard">Dashboard</Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <h2 className="mb-4 text-lg font-medium">Create household</h2>
                    <Form action="/residents/households" method="post" className="grid gap-4 md:grid-cols-2">
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="household_code">Household code *</Label>
                                    <Input id="household_code" name="household_code" required />
                                    {errors.household_code && (
                                        <p className="text-sm text-destructive">{errors.household_code}</p>
                                    )}
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
                                    {errors.purok_id && (
                                        <p className="text-sm text-destructive">{errors.purok_id}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="housing_type">Housing type</Label>
                                    <Input id="housing_type" name="housing_type" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" />
                                </div>
                                <div className="md:col-span-2">
                                    <Button type="submit" disabled={processing}>
                                        Create household
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="border-b bg-slate-50/80 text-xs uppercase text-muted-foreground dark:bg-slate-900/40">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Purok</th>
                                <th className="px-4 py-3">Head</th>
                                <th className="px-4 py-3">Members</th>
                                <th className="px-4 py-3 text-right">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {households.data.map((h) => (
                                <tr key={h.id}>
                                    <td className="px-4 py-3 font-medium">{h.household_code}</td>
                                    <td className="px-4 py-3">{h.purok?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {h.head
                                            ? `${h.head.first_name} ${h.head.last_name}`
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 tabular-nums">{h.members_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/residents/households/${h.id}`}>Open</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {households.last_page > 1 && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {households.links.map((link, i) => (
                            <Button
                                key={i}
                                type="button"
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url}
                            >
                                {link.url ? (
                                    <Link href={link.url} preserveState>
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Link>
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
