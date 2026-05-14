import { Head } from '@inertiajs/react';

type ResidentRow = {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    age: number;
    gender: string;
    civil_status: string;
    voter_status: boolean;
    purok: { id: number; name: string } | null;
};

type Props = {
    barangay: { id: number; name: string };
    residents: ResidentRow[];
    printed_at: string;
};

export default function ResidentsPrint({ barangay, residents, printed_at }: Props) {
    return (
        <div className="min-h-screen bg-white p-8 text-slate-900 print:p-6">
            <Head title="Residents list" />

            <div className="mx-auto max-w-5xl">
                <header className="mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold">Resident registry</h1>
                    <p className="mt-1 text-sm text-slate-600">{barangay.name}</p>
                    <p className="mt-2 text-xs text-slate-500">
                        Generated {new Date(printed_at).toLocaleString()}
                    </p>
                </header>

                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="py-2 pr-3 font-semibold">Name</th>
                            <th className="py-2 pr-3 font-semibold">Purok</th>
                            <th className="py-2 pr-3 font-semibold">Age</th>
                            <th className="py-2 pr-3 font-semibold">Gender</th>
                            <th className="py-2 font-semibold">Voter</th>
                        </tr>
                    </thead>
                    <tbody>
                        {residents.map((r) => (
                            <tr key={r.id} className="border-b border-slate-100">
                                <td className="py-2 pr-3">
                                    {[r.first_name, r.middle_name, r.last_name, r.suffix]
                                        .filter(Boolean)
                                        .join(' ')}
                                </td>
                                <td className="py-2 pr-3">{r.purok?.name ?? '—'}</td>
                                <td className="py-2 pr-3 tabular-nums">{r.age}</td>
                                <td className="py-2 pr-3">{r.gender}</td>
                                <td className="py-2">{r.voter_status ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className="mt-8 text-xs text-slate-500">
                    Use your browser Print dialog (Ctrl+P) to save as PDF.
                </p>
            </div>
        </div>
    );
}
