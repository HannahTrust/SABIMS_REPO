import { Form, Head, Link } from '@inertiajs/react';
import { Calendar, FileText, Users, BookOpen, ArrowLeft, Upload, Edit3, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sessions', href: '/sessions' },
    { title: 'Create', href: '/sessions/create' },
];

type Committee = { id: number; name: string };

type Props = {
    committees: Committee[];
};

const textareaClassName =
    'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow';

export default function SessionsCreate({ committees }: Props) {
    const [minutesType, setMinutesType] = useState<'upload' | 'text'>('upload');
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} contentWide>
            <Head title="Create Session" />
            
            <div className="flex-1 space-y-6 p-6 md:p-8">
                {/* Header with back button */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/sessions">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Create New Session</h1>
                        <p className="text-sm text-muted-foreground">
                            Schedule a new parliamentary session and add its details
                        </p>
                    </div>
                </div>

                {/* Main Form */}
                <div className="max-w-3xl">
                    <Form
                        action="/sessions"
                        method="post"
                        className="space-y-8"
                        encType="multipart/form-data"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="minutes_type"
                                    value={minutesType}
                                />

                                {/* Basic Information Section */}
                                <div className="rounded-lg border bg-card">
                                    <div className="border-b bg-muted/50 px-6 py-4">
                                        <h2 className="text-lg font-medium flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            Basic Information
                                        </h2>
                                    </div>
                                    
                                    <div className="space-y-5 p-6">
                                        {/* Session Title */}
                                        <div className="space-y-2">
                                            <Label htmlFor="session_title" className="text-sm font-medium">
                                                Session Title <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="session_title"
                                                name="session_title"
                                                type="text"
                                                required
                                                placeholder="e.g. Regular Council Session"
                                                className="transition-shadow focus:ring-2"
                                            />
                                            <InputError message={errors.session_title} />
                                        </div>

                                        {/* Session Date */}
                                        <div className="space-y-2">
                                            <Label htmlFor="session_date" className="text-sm font-medium">
                                                Session Date & Time <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="session_date"
                                                name="session_date"
                                                type="datetime-local"
                                                required
                                                className="transition-shadow focus:ring-2"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Select the date and time when the session will take place
                                            </p>
                                            <InputError message={errors.session_date} />
                                        </div>

                                        {/* Committee Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="committee_id" className="text-sm font-medium flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Committee (Optional)
                                            </Label>
                                            <select
                                                id="committee_id"
                                                name="committee_id"
                                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                                            >
                                                <option value="">All SB Members (Default)</option>
                                                {committees.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-muted-foreground">
                                                Leave as "All SB Members" to include everyone, or select a specific committee
                                            </p>
                                            <InputError message={errors.committee_id} />
                                        </div>
                                    </div>
                                </div>

                                {/* Agenda Section */}
                                <div className="rounded-lg border bg-card">
                                    <div className="border-b bg-muted/50 px-6 py-4">
                                        <h2 className="text-lg font-medium flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                                            Agenda
                                        </h2>
                                    </div>
                                    
                                    <div className="p-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="agenda" className="text-sm font-medium">
                                                Meeting Agenda
                                            </Label>
                                            <textarea
                                                id="agenda"
                                                name="agenda"
                                                rows={4}
                                                className={textareaClassName}
                                                placeholder="• Call to order&#10;• Approval of previous minutes&#10;• Committee reports&#10;• Unfinished business&#10;• New business&#10;• Adjournment"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                List the items to be discussed during the session
                                            </p>
                                            <InputError message={errors.agenda} />
                                        </div>
                                    </div>
                                </div>

                                {/* Minutes Section */}
                                <div className="rounded-lg border bg-card">
                                    <div className="border-b bg-muted/50 px-6 py-4">
                                        <h2 className="text-lg font-medium flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            Minutes of the Meeting
                                        </h2>
                                    </div>
                                    
                                    <div className="p-6 space-y-6">
                                        {/* Minutes Type Selection - Modern Toggle */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-1 bg-muted/30 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setMinutesType('upload')}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all",
                                                    minutesType === 'upload'
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                                )}
                                            >
                                                <Upload className="h-4 w-4" />
                                                Upload Document
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMinutesType('text')}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all",
                                                    minutesType === 'text'
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                                )}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                                Write Minutes
                                            </button>
                                        </div>

                                        {minutesType === 'upload' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="minutes_file" className="text-sm font-medium">
                                                        Upload Minutes File
                                                    </Label>
                                                    <div className="relative">
                                                        <input
                                                            key="minutes_file"
                                                            id="minutes_file"
                                                            name="minutes_file"
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={handleFileChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        <div className={cn(
                                                            "flex items-center justify-between p-4 border-2 border-dashed rounded-lg transition-colors",
                                                            fileName ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
                                                        )}>
                                                            <div className="flex items-center gap-3">
                                                                <Upload className="h-5 w-5 text-muted-foreground" />
                                                                <div>
                                                                    <p className="text-sm font-medium">
                                                                        {fileName || 'Click to upload or drag and drop'}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        PDF, DOC, or DOCX (max. 10MB)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {fileName && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setFileName(null);
                                                                        const input = document.getElementById('minutes_file') as HTMLInputElement;
                                                                        if (input) input.value = '';
                                                                    }}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <InputError message={errors.minutes_file} />
                                                </div>
                                            </div>
                                        )}

                                        {minutesType === 'text' && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <Label htmlFor="minutes_content" className="text-sm font-medium">
                                                    Minutes Content
                                                </Label>
                                                <textarea
                                                    id="minutes_content"
                                                    name="minutes_content"
                                                    rows={8}
                                                    className={textareaClassName}
                                                    placeholder="The session started at 9:00 AM. Roll call was conducted with all members present. The agenda was approved as presented..."
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Write the minutes directly in the text area
                                                </p>
                                                <InputError message={errors.minutes_content} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center gap-3 pt-4">
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        size="lg"
                                        className="min-w-[120px]"
                                    >
                                        {processing ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Session'
                                        )}
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="lg"
                                        asChild
                                    >
                                        <Link href="/sessions">Cancel</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}