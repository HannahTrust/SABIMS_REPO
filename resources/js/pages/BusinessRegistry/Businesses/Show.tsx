import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import type { BreadcrumbItem } from '@/types';

type Doc = {
    id: number;
    document_type: string;
    file_path: string;
    uploaded_by?: { id: number; name: string };
    created_at: string;
};

type Clr = {
    id: number;
    clearance_number: string;
    issue_date: string;
    expiration_date: string | null;
    status: string;
    remarks: string | null;
    issuer?: { id: number; name: string };
};

type Log = {
    id: number;
    action: string;
    description: string;
    created_at: string;
    ip_address: string | null;
};

type Biz = {
    id: number;
    business_name: string;
    business_code: string;
    status: string;
    address: string;
    business_description: string | null;
    date_started: string;
    owner_name: string;
    owner_contact: string;
    owner_email: string | null;
    permit_number: string | null;
    permit_issue_date: string | null;
    permit_expiration_date: string | null;
    monthly_income_estimate: string | null;
    latitude: string | null;
    longitude: string | null;
    remarks: string | null;
    logo_path: string | null;
    business_type: string;
    category?: { id: number; name: string; code: string };
    barangay?: { id: number; name: string; code: string };
    purok?: { id: number; name: string; code: string };
    primary_owner_resident?: {
        id: number;
        first_name: string;
        middle_name: string | null;
        last_name: string;
    } | null;
    owners: Array<{
        id: number;
        full_name: string;
        contact_number: string;
        email: string | null;
        ownership_percentage: number | null;
        resident?: { id: number; first_name: string; last_name: string } | null;
    }>;
    documents: Doc[];
    clearances: Clr[];
};

type Props = {
    business: Biz;
    permit_status: string;
    activity: Log[];
    active_tab: string;
};

const tabs = ['overview', 'owners', 'documents', 'permits', 'clearances', 'activity'] as const;

export default function BusinessShow({ business, permit_status, activity, active_tab }: Props) {
    const page = usePage();
    const { business_registry: br, flash } = page.props as {
        business_registry?: {
            can_update?: boolean;
            can_delete?: boolean;
            can_renew_permit?: boolean;
            can_generate_clearance?: boolean;
        };
        flash?: { status?: string };
    };

    const tab = tabs.includes(active_tab as (typeof tabs)[number]) ? active_tab : 'overview';

    function setTab(t: string) {
        router.get(
            `/business-registry/businesses/${business.id}`,
            { tab: t },
            { preserveState: true, preserveScroll: true },
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Business Registry', href: '/business-registry/dashboard' },
        { title: 'Directory', href: '/business-registry/businesses' },
        { title: business.business_name, href: `/business-registry/businesses/${business.id}` },
    ];

    const logoUrl = business.logo_path ? `/storage/${business.logo_path}` : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title={business.business_name} />

            <div className="flex flex-col gap-6">
                {flash?.status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200">
                        {flash.status}
                    </div>
                )}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                        {logoUrl ? (
                            <img src={logoUrl} alt="" className="size-16 shrink-0 rounded-lg border object-cover" />
                        ) : (
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border bg-muted">
                                <Building2 className="size-8 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">{business.business_name}</h1>
                            <p className="text-sm text-muted-foreground">{business.business_code}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{business.status}</span>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{permit_status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {br?.can_update && (
                            <Button variant="outline" asChild>
                                <Link href={`/business-registry/businesses/${business.id}/edit`}>Edit</Link>
                            </Button>
                        )}
                        {br?.can_delete && business.status !== 'closed' && (
                            <Button
                                variant="destructive"
                                type="button"
                                onClick={() => {
                                    if (!confirm('Close this business? This archives the record.')) return;
                                    router.patch(`/business-registry/businesses/${business.id}/archive`, {
                                        remarks: '',
                                    });
                                }}
                            >
                                Close business
                            </Button>
                        )}
                    </div>
                </div>

                <nav className="flex flex-wrap gap-2 border-b border-border pb-2">
                    {tabs.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                                tab === t
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </nav>

                {tab === 'overview' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <section className="rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80">
                            <h2 className="mb-3 text-sm font-semibold">Details</h2>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Category</dt>
                                    <dd>{business.category?.name ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Type</dt>
                                    <dd className="capitalize">{business.business_type.replace(/_/g, ' ')}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Barangay</dt>
                                    <dd>{business.barangay?.name ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Purok</dt>
                                    <dd>{business.purok?.name ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Started</dt>
                                    <dd>{business.date_started?.slice(0, 10)}</dd>
                                </div>
                                <div className="md:col-span-2">
                                    <dt className="text-muted-foreground">Address</dt>
                                    <dd className="mt-1">{business.address}</dd>
                                </div>
                                {business.business_description ? (
                                    <div className="md:col-span-2">
                                        <dt className="text-muted-foreground">Description</dt>
                                        <dd className="mt-1">{business.business_description}</dd>
                                    </div>
                                ) : null}
                            </dl>
                        </section>
                        <section className="rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80">
                            <h2 className="mb-3 text-sm font-semibold">Primary owner</h2>
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-muted-foreground">Name</dt>
                                    <dd>{business.owner_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Contact</dt>
                                    <dd>{business.owner_contact}</dd>
                                </div>
                                {business.owner_email ? (
                                    <div>
                                        <dt className="text-muted-foreground">Email</dt>
                                        <dd>{business.owner_email}</dd>
                                    </div>
                                ) : null}
                                {business.primary_owner_resident ? (
                                    <div>
                                        <dt className="text-muted-foreground">Resident record</dt>
                                        <dd>
                                            {[
                                                business.primary_owner_resident.first_name,
                                                business.primary_owner_resident.last_name,
                                            ].join(' ')}
                                        </dd>
                                    </div>
                                ) : null}
                            </dl>
                        </section>
                    </div>
                )}

                {tab === 'owners' && (
                    <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80">
                        <h2 className="mb-4 text-sm font-semibold">Co-owners</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 pr-4">Name</th>
                                        <th className="py-2 pr-4">Contact</th>
                                        <th className="py-2 pr-4">%</th>
                                        <th className="py-2">Resident</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {business.owners.map((o) => (
                                        <tr key={o.id} className="border-b border-border/60">
                                            <td className="py-2 pr-4">{o.full_name}</td>
                                            <td className="py-2 pr-4">{o.contact_number}</td>
                                            <td className="py-2 pr-4">{o.ownership_percentage ?? '—'}</td>
                                            <td className="py-2">{o.resident ? `${o.resident.first_name} ${o.resident.last_name}` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {business.owners.length === 0 && (
                                <p className="text-sm text-muted-foreground">No additional owners recorded.</p>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'documents' && (
                    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80">
                        <h2 className="text-sm font-semibold">Documents</h2>
                        {br?.can_update && (
                            <Form
                                action={`/business-registry/businesses/${business.id}/documents`}
                                method="post"
                                encType="multipart/form-data"
                                className="grid gap-3 rounded-lg border border-dashed p-4 md:grid-cols-2"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Type</Label>
                                            <Input name="documents[0][document_type]" placeholder="e.g. DTI Permit" required />
                                            <InputError message={errors['documents.0.document_type']} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>File</Label>
                                            <Input type="file" name="documents[0][file]" required />
                                            <InputError message={errors['documents.0.file']} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Button type="submit" size="sm" disabled={processing}>
                                                Upload
                                            </Button>
                                        </div>
                                        <InputError message={errors.documents} />
                                    </>
                                )}
                            </Form>
                        )}
                        <ul className="divide-y divide-border/80">
                            {business.documents.map((d) => (
                                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                                    <div>
                                        <div className="font-medium">{d.document_type}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {d.uploaded_by?.name ?? '—'} · {d.created_at}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/storage/${d.file_path}`} target="_blank" rel="noreferrer">
                                                Download
                                            </a>
                                        </Button>
                                        {br?.can_update && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                className="text-destructive"
                                                onClick={() => {
                                                    if (!confirm('Remove this document?')) return;
                                                    router.delete(`/business-registry/businesses/${business.id}/documents/${d.id}`);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {business.documents.length === 0 && (
                            <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                        )}
                    </div>
                )}

                {tab === 'permits' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <section className="rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80">
                            <h2 className="mb-3 text-sm font-semibold">Current permit</h2>
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-muted-foreground">Number</dt>
                                    <dd>{business.permit_number ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Issued</dt>
                                    <dd>{business.permit_issue_date?.slice(0, 10) ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Expires</dt>
                                    <dd>{business.permit_expiration_date?.slice(0, 10) ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Computed status</dt>
                                    <dd className="capitalize">{permit_status}</dd>
                                </div>
                            </dl>
                        </section>
                        {br?.can_renew_permit && business.status !== 'closed' && (
                            <section className="rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80">
                                <h2 className="mb-3 text-sm font-semibold">Renew permit</h2>
                                <Form
                                    action={`/business-registry/businesses/${business.id}/permit/renew`}
                                    method="post"
                                    className="space-y-3"
                                >
                                    {({ processing, errors }) => (
                                        <>
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
                                            <InputError message={errors.permit_expiration_date} />
                                            <Button type="submit" size="sm" disabled={processing}>
                                                Save renewal
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </section>
                        )}
                    </div>
                )}

                {tab === 'clearances' && (
                    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80">
                        <h2 className="text-sm font-semibold">Clearance history</h2>
                        {br?.can_generate_clearance && business.status !== 'closed' && (
                            <Form
                                action={`/business-registry/businesses/${business.id}/clearances`}
                                method="post"
                                className="mb-6 grid gap-3 rounded-lg border border-dashed p-4 md:grid-cols-2"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="expiration_date">Expiration (optional)</Label>
                                            <Input id="expiration_date" type="date" name="expiration_date" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="clr_remarks">Remarks</Label>
                                            <textarea id="clr_remarks" name="remarks" rows={2} className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                        </div>
                                        <InputError message={errors.clearance} />
                                        <div className="md:col-span-2">
                                            <Button type="submit" size="sm" disabled={processing}>
                                                Generate clearance
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        )}
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="py-2">Number</th>
                                    <th className="py-2">Issued</th>
                                    <th className="py-2">Expires</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {business.clearances.map((c) => (
                                    <tr key={c.id} className="border-b border-border/60">
                                        <td className="py-2 font-mono text-xs">{c.clearance_number}</td>
                                        <td className="py-2">{c.issue_date?.slice(0, 10)}</td>
                                        <td className="py-2">{c.expiration_date?.slice(0, 10) ?? '—'}</td>
                                        <td className="py-2 capitalize">{c.status}</td>
                                        <td className="py-2 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/business-registry/clearances/${c.id}/print`} target="_blank">
                                                    Print
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {business.clearances.length === 0 && (
                            <p className="text-sm text-muted-foreground">No clearances issued yet.</p>
                        )}
                    </div>
                )}

                {tab === 'activity' && (
                    <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-zinc-700/80">
                        <h2 className="mb-4 text-sm font-semibold">Registry audit trail</h2>
                        <ul className="space-y-3 text-sm">
                            {activity.map((a) => (
                                <li key={a.id} className="border-b border-border/60 pb-3 last:border-0">
                                    <div className="font-medium capitalize">{a.action.replace(/_/g, ' ')}</div>
                                    <div className="text-muted-foreground">{a.description}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {a.created_at}
                                        {a.ip_address ? ` · ${a.ip_address}` : ''}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {activity.length === 0 && (
                            <p className="text-sm text-muted-foreground">No activity logged yet.</p>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
