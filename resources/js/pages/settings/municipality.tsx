import { Form, Head, usePage } from '@inertiajs/react';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

type Municipality = {
    id: number;
    name: string;
    system_name: string;
    module_name: string | null;
    logo_url: string | null;
};

type Props = {
    municipality: Municipality;
};

export default function MunicipalitySettings({ municipality }: Props) {
    const [logoName, setLogoName] = useState('');
    const status = (usePage().props as { flash?: { status?: string } }).flash?.status;

    return (
        <AppLayout breadcrumbs={[{ title: 'Settings', href: '/settings/profile' }]}>
            <Head title="Municipality branding" />
            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        title="Municipality branding"
                        description={`Customize how ${municipality.name} appears in the system.`}
                    />
                    {status ? (
                        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                            {status}
                        </p>
                    ) : null}
                    {municipality.logo_url ? (
                        <img
                            src={municipality.logo_url}
                            alt=""
                            className="h-16 w-16 rounded-lg border object-contain"
                        />
                    ) : null}
                    <Form
                        action="/settings/municipality"
                        method="post"
                        encType="multipart/form-data"
                        className="max-w-lg space-y-4"
                    >
                        <input type="hidden" name="_method" value="PATCH" />
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="system_name">System display name *</Label>
                                    <Input
                                        id="system_name"
                                        name="system_name"
                                        defaultValue={municipality.system_name}
                                        required
                                    />
                                    <InputError message={errors.system_name} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="module_name">Module subtitle</Label>
                                    <Input
                                        id="module_name"
                                        name="module_name"
                                        defaultValue={municipality.module_name ?? ''}
                                    />
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
                                <Button type="submit" disabled={processing}>
                                    Save branding
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
