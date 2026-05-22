import { Head } from '@inertiajs/react';

type Witness = { name: string; contact: string | null; statement: string | null };

type Report = {
    report_number: string;
    incident_type: { name: string } | null;
    complainant: { name: string } | null;
    respondent: { name: string } | null;
    respondent_name: string | null;
    incident_datetime: string | null;
    incident_location: string;
    narrative: string;
    action_taken: string | null;
    remarks: string | null;
    assigned_officer: { name: string } | null;
    status: string;
    settlement_date: string | null;
    purok_id: number | null;
    barangay: { name: string; code: string } | null;
    witnesses: Witness[];
};

type Props = {
    report: Report;
    printed_at: string;
};

function titleCaseStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function IncidentReportPrint({ report, printed_at }: Props) {
    const respondent = report.respondent?.name ?? report.respondent_name ?? '—';

    return (
        <div className="min-h-screen bg-white p-8 text-slate-900 print:p-12">
            <Head title={`Incident Report ${report.report_number}`} />

            <div className="mx-auto max-w-3xl border border-slate-200 p-8 print:border-0">
                <header className="border-b border-slate-200 pb-6 text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Barangay incident report</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">{report.barangay?.name ?? 'Barangay'}</h1>
                    <p className="mt-1 text-sm text-slate-600">SABIMS · Incident Reporting</p>
                    <p className="mt-3 font-mono text-sm font-semibold">{report.report_number}</p>
                </header>

                <section className="mt-8 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Status</span>
                        <span className="font-medium">{titleCaseStatus(report.status)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Incident type</span>
                        <span>{report.incident_type?.name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Date & time</span>
                        <span>{report.incident_datetime ? new Date(report.incident_datetime).toLocaleString() : '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Location</span>
                        <span className="text-right">{report.incident_location}</span>
                    </div>
                    {report.purok_id && (
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-500">Purok</span>
                            <span>Purok {report.purok_id}</span>
                        </div>
                    )}
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Complainant</span>
                        <span>{report.complainant?.name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Respondent</span>
                        <span>{respondent}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Assigned officer</span>
                        <span>{report.assigned_officer?.name ?? '—'}</span>
                    </div>
                    {report.settlement_date && (
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-500">Settlement date</span>
                            <span>{report.settlement_date}</span>
                        </div>
                    )}
                </section>

                <section className="mt-8 text-sm leading-relaxed">
                    <p className="text-xs font-semibold uppercase text-slate-500">Narrative</p>
                    <p className="mt-2 whitespace-pre-wrap text-slate-800">{report.narrative}</p>
                    {report.action_taken && (
                        <>
                            <p className="mt-6 text-xs font-semibold uppercase text-slate-500">Action taken</p>
                            <p className="mt-2 whitespace-pre-wrap text-slate-800">{report.action_taken}</p>
                        </>
                    )}
                    {report.remarks && (
                        <>
                            <p className="mt-6 text-xs font-semibold uppercase text-slate-500">Remarks</p>
                            <p className="mt-2 whitespace-pre-wrap text-slate-800">{report.remarks}</p>
                        </>
                    )}
                </section>

                {report.witnesses.length > 0 && (
                    <section className="mt-8 text-sm">
                        <p className="text-xs font-semibold uppercase text-slate-500">Witnesses</p>
                        <ol className="mt-3 list-decimal space-y-2 pl-5">
                            {report.witnesses.map((w) => (
                                <li key={w.name}>
                                    <span className="font-medium">{w.name}</span>
                                    {w.contact && <span className="text-slate-600"> — {w.contact}</span>}
                                    {w.statement && <p className="mt-1 text-slate-700">{w.statement}</p>}
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                <footer className="mt-12 border-t border-slate-200 pt-6 text-sm">
                    <div className="flex justify-between gap-4">
                        <div className="text-xs text-slate-500">
                            <p>Printed {printed_at}</p>
                        </div>
                        <div className="text-right">
                            <p className="mt-8">_________________________</p>
                            <p className="mt-1 text-xs text-slate-500">Lupon / Barangay official</p>
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
