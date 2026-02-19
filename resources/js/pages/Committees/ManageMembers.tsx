import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CommitteeController from '@/actions/App/Http/Controllers/CommitteeController';

type Committee = {
    id: number;
    name: string;
    chair_id: number | null;
    member_ids: number[];
};

type SbMember = {
    id: number;
    name: string;
};

type Props = {
    committee: Committee;
    sbMembers: SbMember[];
};

export default function CommitteesManageMembers({
    committee,
    sbMembers,
}: Props) {
    const [memberIds, setMemberIds] = useState<number[]>(() => committee.member_ids);
    const [chairId, setChairId] = useState<number | null>(() => committee.chair_id);

    const toggleMember = useCallback((userId: number) => {
        setMemberIds((prev) => {
            const next = prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId];
            setChairId((c) => {
                if (c === userId) return next[0] ?? null;
                if (next.includes(c ?? -1)) return c;
                return next[0] ?? null;
            });
            return next;
        });
    }, []);

    const { flash } = usePage().props as { flash?: { status?: string } };
    const errors = (usePage().props as { errors?: Record<string, string> }).errors ?? {};
    const selectedMembersForChair = sbMembers.filter((m) => memberIds.includes(m.id));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Committees', href: '/committees' },
        {
            title: committee.name,
            href: `/committees/${committee.id}/manage-members`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage members – ${committee.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash?.status && (
                    <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {flash.status}
                    </p>
                )}

                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-xl font-semibold">
                            Manage members – {committee.name}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Select SB members for this committee and choose the
                            chair.
                        </p>
                    </div>

                    <Form
                        {...CommitteeController.updateMembers.form({
                            committee: committee.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {memberIds.map((id) => (
                            <input
                                key={id}
                                type="hidden"
                                name="members[]"
                                value={id}
                            />
                        ))}
                        <input
                            type="hidden"
                            name="chair_id"
                            value={chairId ?? ''}
                        />

                        <div className="space-y-2">
                            <Label>Members</Label>
                            <InputError message={errors.members} />
                            <InputError message={errors['members.0']} />
                            <ul className="flex flex-col gap-2 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border p-3">
                                {sbMembers.length === 0 ? (
                                    <li className="text-sm text-muted-foreground">
                                        No SB members found. Users with role
                                        &quot;sb_member&quot; will appear here.
                                    </li>
                                ) : (
                                    sbMembers.map((member) => (
                                        <li
                                            key={member.id}
                                            className="flex items-center gap-3"
                                        >
                                            <Checkbox
                                                id={`member-${member.id}`}
                                                checked={memberIds.includes(
                                                    member.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleMember(member.id)
                                                }
                                            />
                                            <Label
                                                htmlFor={`member-${member.id}`}
                                                className="cursor-pointer font-normal"
                                            >
                                                {member.name}
                                            </Label>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="chair_id">Chair</Label>
                            <InputError message={errors.chair_id} />
                            <Select
                                value={chairId?.toString() ?? ''}
                                onValueChange={(v) =>
                                    setChairId(v ? parseInt(v, 10) : null)
                                }
                                disabled={selectedMembersForChair.length === 0}
                            >
                                <SelectTrigger id="chair_id" className="w-full">
                                    <SelectValue placeholder="Select chair (must be a selected member)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedMembersForChair.map((m) => (
                                        <SelectItem
                                            key={m.id}
                                            value={m.id.toString()}
                                        >
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedMembersForChair.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Select at least one member to choose a
                                    chair.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={
                                    memberIds.length === 0 ||
                                    (memberIds.length > 0 && chairId === null)
                                }
                            >
                                Save members and chair
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/committees">Back to committees</Link>
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}
