import AppLogoIcon from '@/components/app-logo-icon';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    CalendarDays,
    BarChart3,
    Users,
    ShieldCheck,
    Bell,
    History,
    AlertTriangle,
    MapPin,
    FileSignature,
    Landmark,
    Facebook,
    Twitter,
    Instagram,
    ArrowRight,
    Check,
    Target,
    Eye,
    Zap,
    Gavel,
    BookOpenCheck,
    Vote,
    FolderOpen,
    Sparkles,
} from 'lucide-react';
import { useState, useEffect, type ComponentType } from 'react';
import { dashboard, login, register } from '@/routes';

type ModuleStatus = 'available' | 'coming-soon';

type ModuleCard = {
    Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    title: string;
    description: string;
    status: ModuleStatus;
    accent: string;
    iconBg: string;
    iconColor: string;
};

const modules: ModuleCard[] = [
    {
        Icon: Landmark,
        title: 'SABIMS — Legislative System',
        description: 'Sangguniang Bayan operations: committees, ordinances, resolutions, sessions, and a centralized legislative document repository.',
        status: 'available',
        accent: 'from-blue-50 to-blue-100/60 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/50',
        iconBg: 'bg-blue-100 dark:bg-blue-900/40',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        Icon: Users,
        title: 'Resident & Household',
        description: 'Resident profiling, household grouping, demographic tracking, and powerful search across all barangays.',
        status: 'coming-soon',
        accent: 'from-emerald-50 to-emerald-100/60 dark:from-emerald-900/20 dark:to-emerald-800/10 border-emerald-200 dark:border-emerald-800/40',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        Icon: FileSignature,
        title: 'Request Management',
        description: 'Online requests for clearance, indigency, and residency with status tracking and approval workflows.',
        status: 'coming-soon',
        accent: 'from-amber-50 to-amber-100/60 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800/40',
        iconBg: 'bg-amber-100 dark:bg-amber-900/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
        Icon: FileText,
        title: 'Document Generation',
        description: 'Auto-filled templates, printable certificates, and complete document history for every transaction.',
        status: 'coming-soon',
        accent: 'from-violet-50 to-violet-100/60 dark:from-violet-900/20 dark:to-violet-800/10 border-violet-200 dark:border-violet-800/40',
        iconBg: 'bg-violet-100 dark:bg-violet-900/40',
        iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
        Icon: AlertTriangle,
        title: 'Incident Reporting',
        description: 'Barangay-level incident logs, Purok Leader reports, and end-to-end monitoring of cases.',
        status: 'available',
        accent: 'from-rose-50 to-rose-100/60 dark:from-rose-900/20 dark:to-rose-800/10 border-rose-200 dark:border-rose-800/40',
        iconBg: 'bg-rose-100 dark:bg-rose-900/40',
        iconColor: 'text-rose-600 dark:text-rose-400',
    },
    {
        Icon: MapPin,
        title: 'Purok Management',
        description: 'Purok-based grouping of residents, verification, and endorsement of requests by Purok Leaders.',
        status: 'coming-soon',
        accent: 'from-cyan-50 to-cyan-100/60 dark:from-cyan-900/20 dark:to-cyan-800/10 border-cyan-200 dark:border-cyan-800/40',
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
        Icon: BarChart3,
        title: 'Reports & Analytics',
        description: 'Population statistics, request summaries, barangay performance, and exportable reports.',
        status: 'coming-soon',
        accent: 'from-indigo-50 to-indigo-100/60 dark:from-indigo-900/20 dark:to-indigo-800/10 border-indigo-200 dark:border-indigo-800/40',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
        Icon: ShieldCheck,
        title: 'Users & RBAC',
        description: 'Role-based access control, multi-role support, and permission-based authorization across the platform.',
        status: 'available',
        accent: 'from-teal-50 to-teal-100/60 dark:from-teal-900/30 dark:to-teal-800/20 border-teal-200 dark:border-teal-700/50',
        iconBg: 'bg-teal-100 dark:bg-teal-900/40',
        iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
        Icon: Bell,
        title: 'Notifications',
        description: 'Request updates, system alerts, and activity notifications delivered to the right people in real time.',
        status: 'coming-soon',
        accent: 'from-pink-50 to-pink-100/60 dark:from-pink-900/20 dark:to-pink-800/10 border-pink-200 dark:border-pink-800/40',
        iconBg: 'bg-pink-100 dark:bg-pink-900/40',
        iconColor: 'text-pink-600 dark:text-pink-400',
    },
    {
        Icon: History,
        title: 'Audit Logs',
        description: 'Track every system action and review complete user activity history for accountability.',
        status: 'available',
        accent: 'from-slate-50 to-slate-100/60 dark:from-slate-800/40 dark:to-slate-700/30 border-slate-200 dark:border-slate-600/60',
        iconBg: 'bg-slate-200 dark:bg-slate-700',
        iconColor: 'text-slate-700 dark:text-slate-200',
    },
];

const sabimsFeatures = [
    { Icon: Users, title: 'Committee Management', description: 'Create committees, assign chairs and members, track outputs.' },
    { Icon: Gavel, title: 'Ordinance Management', description: 'Encode ordinances, upload documents, track Draft → Approved → Archived.' },
    { Icon: Vote, title: 'Resolution Management', description: 'Encode resolutions, record voting results, archive records.' },
    { Icon: CalendarDays, title: 'Session Management', description: 'Schedule sessions, upload minutes, track attendance and agenda.' },
    { Icon: FolderOpen, title: 'Document Repository', description: 'Centralized storage with search by title, year, committee, or status.' },
    { Icon: BookOpenCheck, title: 'Compliance-Ready', description: 'Standardized records and workflows aligned with LGU requirements.' },
];

const userTypeGroups = [
    {
        label: 'System Level',
        accent: 'border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-900/10',
        dot: 'bg-blue-600',
        roles: ['Super Admin', 'Municipal Staff'],
    },
    {
        label: 'Barangay Level',
        accent: 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-900/10',
        dot: 'bg-emerald-600',
        roles: ['Barangay Admin', 'Barangay Staff / Secretary', 'Purok Leader', 'Resident'],
    },
    {
        label: 'Legislative (SABIMS)',
        accent: 'border-violet-200 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-900/10',
        dot: 'bg-violet-600',
        roles: ['SB Administrator', 'Vice Mayor (Presiding)', 'SB Secretary', 'SB Member'],
    },
];

const impactStats = [
    { number: 'Less', label: 'Paperwork', sub: 'Digitized end-to-end workflows' },
    { number: 'Faster', label: 'Processing', sub: 'Automated approvals & routing' },
    { number: 'Open', label: 'Transparency', sub: 'Centralized & auditable records' },
    { number: 'Smarter', label: 'Decisions', sub: 'Real-time data & analytics' },
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head title="eBarangayHub — Municipal Integrated Governance System">
                <meta
                    name="description"
                    content="eBarangayHub is the unified digital platform for barangay operations, citizen services, municipal monitoring, and legislative management — including the SABIMS module for the Sangguniang Bayan."
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700|poppins:500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                {/* Navigation */}
                <nav
                    className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                        scrolled
                            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg'
                            : 'bg-transparent'
                    }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">
                            {/* Logo */}
                            <Link href="/" className="flex items-center space-x-3 group">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg transition-shadow group-hover:shadow-blue-500/30">
                                    <AppLogoIcon className="h-12 w-12 object-contain" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">
                                        eBarangayHub
                                    </h1>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
                                        Municipal Integrated Governance System
                                    </p>
                                </div>
                            </Link>

                            {/* Navigation Links */}
                            <div className="flex items-center space-x-4">
                                <a
                                    href="#modules"
                                    className="hidden md:block text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    Modules
                                </a>
                                <a
                                    href="#sabims"
                                    className="hidden md:block text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    SABIMS
                                </a>
                                <a
                                    href="#about"
                                    className="hidden md:block text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    About
                                </a>
                                <a
                                    href="#contact"
                                    className="hidden md:block text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    Contact
                                </a>

                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 font-medium transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105"
                                            >
                                                Register
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-600">
                                <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm">
                                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                                    Municipal Integrated Governance System
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white leading-tight">
                                    One Platform for
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                                        {' '}Every Barangay
                                    </span>
                                </h1>

                                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg">
                                    eBarangayHub centralizes barangay operations, citizen services, municipal monitoring,
                                    and legislative management — including the dedicated <strong>SABIMS</strong> module
                                    for the Sangguniang Bayan.
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all hover:shadow-2xl hover:scale-105 text-lg"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <a
                                        href="#modules"
                                        className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl font-medium hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-lg"
                                    >
                                        Explore Modules
                                    </a>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        Centralized
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        Role-Based Access
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                                        Real-Time
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                                        Audit-Logged
                                    </div>
                                </div>
                            </div>

                            {/* Module preview card - animated */}
                            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl blur-3xl opacity-25 animate-pulse"
                                    style={{ animationDuration: '3s' }}
                                />
                                <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10">
                                    <div className="flex items-center gap-2 mb-4 opacity-90">
                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            eBarangayHub modules
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {[
                                            { Icon: Landmark, iconCl: 'text-blue-600 dark:text-blue-400', from: 'from-blue-50', to: 'to-blue-100', dark: 'dark:from-blue-900/20 dark:to-blue-800/20', delay: '0ms' },
                                            { Icon: Users, iconCl: 'text-emerald-600 dark:text-emerald-400', from: 'from-emerald-50', to: 'to-emerald-100', dark: 'dark:from-emerald-900/20 dark:to-emerald-800/20', delay: '80ms' },
                                            { Icon: FileSignature, iconCl: 'text-amber-600 dark:text-amber-400', from: 'from-amber-50', to: 'to-amber-100', dark: 'dark:from-amber-900/20 dark:to-amber-800/20', delay: '160ms' },
                                            { Icon: FileText, iconCl: 'text-violet-600 dark:text-violet-400', from: 'from-violet-50', to: 'to-violet-100', dark: 'dark:from-violet-900/20 dark:to-violet-800/20', delay: '240ms' },
                                            { Icon: AlertTriangle, iconCl: 'text-rose-600 dark:text-rose-400', from: 'from-rose-50', to: 'to-rose-100', dark: 'dark:from-rose-900/20 dark:to-rose-800/20', delay: '320ms' },
                                            { Icon: BarChart3, iconCl: 'text-indigo-600 dark:text-indigo-400', from: 'from-indigo-50', to: 'to-indigo-100', dark: 'dark:from-indigo-900/20 dark:to-indigo-800/20', delay: '400ms' },
                                        ].map(({ Icon, iconCl, from, to, dark, delay }, i) => (
                                            <div
                                                key={i}
                                                className={`h-20 bg-gradient-to-br ${from} ${to} ${dark} rounded-xl flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 border border-white/50 dark:border-slate-600/30`}
                                                style={{ animationDelay: delay, animationFillMode: 'both' }}
                                            >
                                                <Icon className={`w-7 h-7 ${iconCl}`} strokeWidth={1.5} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        {[0.75, 1, 0.85].map((w, i) => (
                                            <div
                                                key={i}
                                                className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"
                                                style={{
                                                    width: `${w * 100}%`,
                                                    animationDelay: `${500 + i * 100}ms`,
                                                    animationDuration: '1.5s',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modules Section */}
                <section id="modules" className="py-20 bg-white dark:bg-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-14">
                            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-3">
                                Platform Modules
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                                Ten Modules. One Unified Platform.
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                From resident profiling to legislative tracking, eBarangayHub covers every layer of municipal governance.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.map((m, index) => {
                                const Icon = m.Icon;
                                const isAvailable = m.status === 'available';
                                return (
                                    <div
                                        key={index}
                                        className={`group relative p-6 bg-gradient-to-br ${m.accent} rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.iconBg} ${m.iconColor} group-hover:scale-110 transition-transform`}
                                            >
                                                <Icon className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                            {isAvailable ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-700/60 px-2.5 py-1 rounded-full">
                                                    Coming soon
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                            {m.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {m.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* SABIMS Spotlight Section */}
                <section
                    id="sabims"
                    className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(255,255,255,0.15),transparent)]" />
                    <div className="relative max-w-7xl mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-5">
                                    <Landmark className="w-3.5 h-3.5" />
                                    Flagship Module · Available Now
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                    SABIMS — Sangguniang Bayan Information Management System
                                </h2>
                                <p className="text-lg text-blue-100 mb-8 max-w-xl">
                                    The dedicated legislative module of eBarangayHub. Built for SB Administrators, the
                                    Vice Mayor, the SB Secretary, and SB Members to run committees, sessions, ordinances,
                                    and resolutions end-to-end.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={auth.user ? dashboard() : login()}
                                        className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-2xl hover:scale-105"
                                    >
                                        {auth.user ? 'Go to Dashboard' : 'Login to SABIMS'}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    {!auth.user && canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white px-6 py-3 rounded-xl font-medium transition-all"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {sabimsFeatures.map((f, i) => {
                                    const Icon = f.Icon;
                                    return (
                                        <div
                                            key={i}
                                            className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                                                <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
                                            </div>
                                            <h4 className="font-semibold mb-1">{f.title}</h4>
                                            <p className="text-sm text-blue-100/90 leading-relaxed">
                                                {f.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* User Types Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-14">
                            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-3">
                                Built for Every Role
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                                Role-Based Access Across the Municipality
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                Multi-role support with permissions scoped by role and barangay — from residents to
                                the Vice Mayor.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {userTypeGroups.map((g, i) => (
                                <div
                                    key={i}
                                    className={`rounded-2xl border ${g.accent} p-6`}
                                >
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className={`w-2.5 h-2.5 rounded-full ${g.dot}`} />
                                        <h3 className="text-sm font-bold tracking-wider uppercase text-slate-700 dark:text-slate-200">
                                            {g.label}
                                        </h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {g.roles.map((role, ri) => (
                                            <li
                                                key={ri}
                                                className="flex items-center gap-3 text-slate-700 dark:text-slate-200"
                                            >
                                                <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                                                </span>
                                                <span className="text-sm font-medium">{role}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Impact Stats Section */}
                <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">Designed for Real Impact</h2>
                            <p className="text-slate-300 max-w-2xl mx-auto">
                                Reduced paperwork, faster processing, and better coordination between barangays and the
                                Sangguniang Bayan.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {impactStats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
                                >
                                    <div className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                                        {stat.number}
                                    </div>
                                    <div className="font-semibold mb-1">{stat.label}</div>
                                    <div className="text-xs text-slate-400">{stat.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-20 bg-white dark:bg-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-3">
                                    About eBarangayHub
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
                                    Unifying Barangay, Municipal, and Legislative Operations
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                                    eBarangayHub is a web-based integrated municipal governance system designed to
                                    centralize, digitize, and streamline operations across all barangays and the
                                    Sangguniang Bayan.
                                </p>
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                                    The platform connects barangay operations, citizen services, municipal monitoring,
                                    and legislative management into a single secure system — with the SABIMS module
                                    powering the legislative side.
                                </p>
                                <div className="space-y-3">
                                    {[
                                        'Centralized data across all barangays',
                                        'Standardized records, workflows, and reporting',
                                        'Real-time monitoring by the municipality',
                                        'Secure, role-based access control',
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                                            </span>
                                            <span className="text-slate-700 dark:text-slate-200">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl blur-3xl opacity-20" />
                                <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/60 rounded-xl border border-slate-100 dark:border-slate-600/50">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                                <Target className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white">Mission</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    Digitize and unify governance across every barangay.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/60 rounded-xl border border-slate-100 dark:border-slate-600/50">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <Eye className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white">Vision</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    Modern, transparent, and data-driven local governance.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/60 rounded-xl border border-slate-100 dark:border-slate-600/50">
                                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                                <Zap className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white">Goal</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    Empower LGUs with secure, scalable technology.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Modernize Your Municipality?
                        </h2>
                        <p className="text-xl text-slate-300 mb-8">
                            Start with the SABIMS legislative module today — and grow into the full eBarangayHub
                            platform as more modules go live.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href={auth.user ? dashboard() : register()}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all hover:shadow-2xl hover:scale-105 text-lg"
                            >
                                Get Started Now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a
                                href="#contact"
                                className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl font-medium transition-all text-lg"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer id="contact" className="bg-white dark:bg-slate-800 py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <AppLogoIcon className="h-10 w-10 shrink-0 object-contain" />
                                    <span className="font-bold text-slate-800 dark:text-white">eBarangayHub</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Municipal Integrated Governance System — connecting barangays, the municipality,
                                    and the Sangguniang Bayan.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4 text-slate-800 dark:text-white">Platform</h4>
                                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                    <li><a href="#modules" className="hover:text-blue-600 dark:hover:text-blue-400">Modules</a></li>
                                    <li><a href="#sabims" className="hover:text-blue-600 dark:hover:text-blue-400">SABIMS</a></li>
                                    <li><a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400">About</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4 text-slate-800 dark:text-white">Contact</h4>
                                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                    <li>info@ebarangayhub.gov.ph</li>
                                    <li>(02) 0000-0000</li>
                                    <li>Philippines</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4 text-slate-800 dark:text-white">Follow Us</h4>
                                <div className="flex gap-3">
                                    <a
                                        href="#"
                                        className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                                        aria-label="Facebook"
                                    >
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="#"
                                        className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                                        aria-label="Twitter"
                                    >
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="#"
                                        className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                                        aria-label="Instagram"
                                    >
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                            © {new Date().getFullYear()} eBarangayHub — Municipal Integrated Governance System. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
