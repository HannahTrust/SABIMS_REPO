import { useState } from 'react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Users, 
    Plus, 
    Calendar, 
    Edit3, 
    Trash2, 
    UserPlus,
    MoreVertical,
    Clock,
    FileText,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Committees',
        href: '/committees',
    },
];

type Committee = {
    id: number;
    name: string;
    description: string | null;
    chair_id: number | null;
    created_by: number | null;
    created_at: string;
};

type Props = {
    committees: Committee[];
    canCreate: boolean;
    canManageMembers: boolean;
};

export default function CommitteesIndex({
    committees,
    canCreate,
    canManageMembers,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; committee: Committee | null }>({
        open: false,
        committee: null,
    });
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    };

    const handleDelete = (committee: Committee) => {
        setDeleteDialog({ open: true, committee });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Committees" />
            
            <div className="flex-1 space-y-6 p-6 md:p-8">
                {/* Flash Message */}
                {flash?.status && (
                    <div className="animate-in slide-in-from-top-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-200">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            {flash.status}
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Committees</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage parliamentary committees and their members
                            </p>
                        </div>
                    </div>
                    
                    {canCreate && (
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    New Committee
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create New Committee</DialogTitle>
                                    <DialogDescription>
                                        Add a new committee to organize parliamentary work. Fill in the details below.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form
                                    action="/committees"
                                    method="post"
                                    options={{ preserveScroll: true }}
                                    onSuccess={() => setCreateDialogOpen(false)}
                                    resetOnSuccess
                                    className="space-y-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="space-y-4 py-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-sm font-medium">
                                                        Committee Name <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        required
                                                        placeholder="e.g. Ways and Means Committee"
                                                        autoComplete="off"
                                                        className="transition-shadow focus:ring-2"
                                                    />
                                                    <InputError message={errors.name} />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="description" className="text-sm font-medium">
                                                        Description
                                                    </Label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        rows={3}
                                                        className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        placeholder="Describe the committee's purpose and responsibilities..."
                                                    />
                                                    <InputError message={errors.description} />
                                                </div>
                                            </div>
                                            
                                            <DialogFooter className="gap-2 sm:gap-0">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setCreateDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={processing}>
                                                    {processing ? (
                                                        <>
                                                            <span className="animate-spin mr-2">⏳</span>
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        'Create Committee'
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Stats Overview */}
                {committees.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                Total Committees
                            </div>
                            <p className="mt-2 text-2xl font-semibold">{committees.length}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                With Description
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {committees.filter(c => c.description).length}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Latest Created
                            </div>
                            <p className="mt-2 text-sm font-medium">
                                {committees.length > 0 && formatDate(committees[0].created_at)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Committees Grid */}
                {committees.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
                        <div className="rounded-full bg-muted p-4">
                            <Users className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No committees yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                            Get started by creating your first committee to organize parliamentary work.
                        </p>
                        {canCreate && (
                            <Button 
                                className="mt-4 gap-2"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                                Create Committee
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {committees.map((committee) => (
                            <div
                                key={committee.id}
                                className="group relative rounded-lg border bg-card transition-all hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/40"
                            >
                                <div className="p-5">
                                    {/* Header with actions */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            {canCreate && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        asChild
                                                    >
                                                        <Link href={`/committees/${committee.id}/edit`}>
                                                            <Edit3 className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(committee)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Committee Info */}
                                    <div className="mt-4">
                                        <Link 
                                            href={`/committees/${committee.id}`}
                                            className="hover:underline"
                                        >
                                            <h3 className="text-lg font-semibold leading-tight">
                                                {committee.name}
                                            </h3>
                                        </Link>
                                        
                                        {committee.description ? (
                                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                                {committee.description}
                                            </p>
                                        ) : (
                                            <p className="mt-2 text-sm text-muted-foreground italic">
                                                No description provided
                                            </p>
                                        )}
                                    </div>

                                    {/* Metadata */}
                                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(committee.created_at)}
                                        </div>
                                        {canManageMembers && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="h-auto p-0 text-xs"
                                                asChild
                                            >
                                                <Link href={`/committees/${committee.id}/manage-members`}>
                                                    <UserPlus className="h-3 w-3 mr-1" />
                                                    Manage members
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Hover Effect Overlay */}
                                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-gray-900/5 group-hover:ring-primary/20 dark:ring-white/10" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog 
                    open={deleteDialog.open} 
                    onOpenChange={(open: boolean) => !open && setDeleteDialog({ open: false, committee: null })}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Committee</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                                <p>
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-foreground">
                                        {deleteDialog.committee?.name}
                                    </span>?
                                </p>
                                <p className="text-sm text-destructive">
                                    This action cannot be undone. This will permanently delete the committee
                                    and may affect associated sessions and members.
                                </p>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            {deleteDialog.committee && (
                                <Form
                                    action={`/committees/${deleteDialog.committee.id}`}
                                    method="delete"
                                    className="inline"
                                >
                                    <AlertDialogAction asChild>
                                        <Button 
                                            type="submit" 
                                            variant="destructive"
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete Committee
                                        </Button>
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