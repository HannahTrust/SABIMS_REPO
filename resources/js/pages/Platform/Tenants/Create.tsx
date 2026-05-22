import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, ImagePlus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tenants', href: '/platform/tenants' },
    { title: 'Create', href: '/platform/tenants/create' },
];

export default function TenantsCreate() {
    const [logoName, setLogoName] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Create tenant" />

            <div className="flex flex-col gap-6">
                <Button variant="outline" size="sm" asChild className="w-fit gap-2">
                    <Link href="/platform/tenants">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                </Button>

                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Create tenant municipality</h1>
                        <p className="text-xs text-muted-foreground">Register a new LGU vendor on the platform.</p>
                    </div>
                </div>

                <Form action="/platform/tenants" method="post" encType="multipart/form-data" className="max-w-2xl">
                    {({ processing, errors }) => (
                        <div className="space-y-5 rounded-xl border bg-card p-5">
                            <div className="grid gap-1.5">
                                <Label htmlFor="code">Code *</Label>
                                <Input id="code" name="code" required placeholder="e.g. bayawan-city" />
                                <InputError message={errors.code} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="name">Official LGU name *</Label>
                                <Input id="name" name="name" required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="system_name">System display name *</Label>
                                <Input id="system_name" name="system_name" required placeholder="e.g. Bayawan LGU Portal" />
                                <InputError message={errors.system_name} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="module_name">Module subtitle</Label>
                                <Input id="module_name" name="module_name" placeholder="e.g. Legislative Module" />
                                <InputError message={errors.module_name} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="logo">Logo</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="logo"
                                        name="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? '')}
                                    />
                                    <ImagePlus className="h-4 w-4 text-muted-foreground" />
                                </div>
                                {logoName ? <p className="text-xs text-muted-foreground">{logoName}</p> : null}
                                <InputError message={errors.logo} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="is_active">Status</Label>
                                <select
                                    id="is_active"
                                    name="is_active"
                                    defaultValue="1"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                            <Button type="submit" disabled={processing}>
                                Create tenant
                            </Button>
                        </div>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
