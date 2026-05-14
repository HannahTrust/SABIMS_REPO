import { Head } from '@inertiajs/react';

type Biz = {
    business_name: string;
    business_code: string;
    address: string;
    owner_name: string;
    category?: { name: string };
    barangay?: { name: string };
    purok?: { name: string };
};

type Clr = {
    clearance_number: string;
    issue_date: string;
    expiration_date: string | null;
    remarks: string | null;
    issuer?: { name: string };
};

type Props = {
    clearance: Clr;
    business: Biz;
    printed_at: string;
};

export default function ClearancePrint({ clearance, business, printed_at }: Props) {
    return (
        <div className="min-h-screen bg-white p-8 text-slate-900 print:p-12">
            <Head title={`Clearance ${clearance.clearance_number}`} />

            <div className="mx-auto max-w-3xl border border-slate-200 p-8 print:border-0">
                <header className="border-b border-slate-200 pb-6 text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Barangay business clearance</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">{business.barangay?.name ?? 'Barangay'}</h1>
                    <p className="mt-1 text-sm text-slate-600">eBarangayHub · Business Registry</p>
                </header>

                <section className="mt-8 space-y-4 text-sm leading-relaxed">
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Clearance no.</span>
                        <span className="font-mono font-semibold">{clearance.clearance_number}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Business</span>
                        <span className="text-right font-medium">{business.business_name}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Registration code</span>
                        <span className="font-mono text-xs">{business.business_code}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Owner</span>
                        <span className="text-right">{business.owner_name}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Address</span>
                        <span className="text-right">{business.address}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Category</span>
                        <span>{business.category?.name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Purok</span>
                        <span>{business.purok?.name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Issued</span>
                        <span>{clearance.issue_date?.slice(0, 10)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Valid until</span>
                        <span>{clearance.expiration_date?.slice(0, 10) ?? '—'}</span>
                    </div>
                    {clearance.remarks ? (
                        <div className="rounded-md bg-slate-50 p-3 text-slate-700">
                            <p className="text-xs font-medium uppercase text-slate-500">Remarks</p>
                            <p className="mt-1">{clearance.remarks}</p>
                        </div>
                    ) : null}
                </section>

                <footer className="mt-12 border-t border-slate-200 pt-6 text-sm">
                    <div className="flex justify-between gap-4">
                        <div>
                            <p className="text-slate-500">Issued by</p>
                            <p className="font-medium">{clearance.issuer?.name ?? '—'}</p>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                            <p>Printed {printed_at}</p>
                            <p className="mt-4">_________________________</p>
                            <p className="mt-1">Authorized signature</p>
                        </div>
                    </div>
                </footer>
            </div>

            <div className="mx-auto mt-8 max-w-3xl print:hidden">
                <button
                    type="button"
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
                    onClick={() => window.print()}
                >
                    Print / Save as PDF
                </button>
            </div>
        </div>
    );
}
