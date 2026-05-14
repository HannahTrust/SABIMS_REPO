import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Member = {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    age: number;
    gender: string;
};

type Household = {
    id: number;
    household_code: string;
    address: string | null;
    monthly_income: string | null;
    housing_type: string | null;
    is_active: boolean;
    barangay_id: number;
    purok: { id: number; name: string } | null;
    head: Member | null;
    members: Member[];
};

type Props = {
    household: Household;
};

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function HouseholdShow({ household }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Population', href: '/residents/dashboard' },
        { title: 'Households', href: '/residents/households' },
        { title: household.household_code, href: `/residents/households/${household.id}` },
    ];

    const memberOptions = household.members.map((m) => ({
        id: m.id,
        label: [m.first_name, m.middle_name, m.last_name, m.suffix].filter(Boolean).join(' '),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={`Household ${household.household_code}`} />

            <div className="mx-auto max-w-4xl space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{household.household_code}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {household.purok?.name ?? 'Purok'} · {household.members.length} members
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/residents/households">Back</Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <h2 className="mb-4 text-lg font-medium">Household details</h2>
                    <dl className="grid gap-3 text-sm md:grid-cols-2">
                        <div>
                            <dt className="text-muted-foreground">Head</dt>
                            <dd className="font-medium">
                                {household.head
                                    ? [
                                          household.head.first_name,
                                          household.head.middle_name,
                                          household.head.last_name,
                                          household.head.suffix,
                                      ]
                                          .filter(Boolean)
                                          .join(' ')
                                    : 'Not assigned'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Housing type</dt>
                            <dd>{household.housing_type ?? '—'}</dd>
                        </div>
                        <div className="md:col-span-2">
                            <dt className="text-muted-foreground">Address</dt>
                            <dd>{household.address ?? '—'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <h2 className="mb-4 text-lg font-medium">Assign household head</h2>
                    <Form
                        action={`/residents/households/${household.id}/head`}
                        method="post"
                        className="flex flex-col gap-4 sm:flex-row sm:items-end"
                    >
                        {({ processing }) => (
                            <>
                                <input type="hidden" name="_method" value="patch" />
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="resident_id">Household member</Label>
                                    <select
                                        id="resident_id"
                                        name="resident_id"
                                        className={selectClass}
                                        defaultValue={household.head?.id ?? ''}
                                    >
                                        <option value="">— No head —</option>
                                        {memberOptions.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button type="submit" disabled={processing}>
                                    Save
                                </Button>
                            </>
                        )}
                    </Form>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                    <h2 className="border-b px-6 py-4 text-lg font-medium">Members</h2>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-slate-50/80 text-xs uppercase text-muted-foreground dark:bg-slate-900/40">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Age</th>
                                <th className="px-6 py-3">Gender</th>
                                <th className="px-6 py-3 text-right">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {household.members.map((m) => (
                                <tr key={m.id}>
                                    <td className="px-6 py-3 font-medium">
                                        {[m.first_name, m.middle_name, m.last_name, m.suffix]
                                            .filter(Boolean)
                                            .join(' ')}
                                    </td>
                                    <td className="px-6 py-3 tabular-nums">{m.age}</td>
                                    <td className="px-6 py-3">{m.gender}</td>
                                    <td className="px-6 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/residents/${m.id}/edit`}>Edit</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
