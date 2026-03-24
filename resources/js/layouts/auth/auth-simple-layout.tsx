import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { AuthLayoutProps } from '@/types';
import { home } from '@/routes';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-dvh flex-col bg-slate-50 dark:bg-slate-950 lg:flex-row">
            {/* Left column: Logo & branding — 50% on desktop */}
            <div className="relative flex min-h-[280px] flex-1 flex-col items-center justify-center px-6 py-12 lg:min-h-0 lg:w-1/2 lg:flex-none lg:px-12 lg:py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-blue-800 dark:via-blue-900 dark:to-slate-900 lg:block" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.12),transparent)]" />
                <div className="relative z-10 flex flex-col items-center text-center lg:max-w-md">
                    <Link
                        href={home()}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-800 rounded-2xl"
                        aria-label="SABIMS Home"
                    >
                        <div className="animate-auth-logo flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 shadow-xl backdrop-blur-md sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                            <AppLogoIcon className="h-12 w-12 fill-white text-white drop-shadow-lg sm:h-14 sm:w-14 lg:h-16 lg:w-16 animate-auth-logo-glow" />
                        </div>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        SABIMS
                    </h2>
                    <p className="mt-3 text-sm text-blue-100 sm:text-base">
                        Sangguniang Bayan Information Management System
                    </p>
                    <p className="mt-6 hidden text-left text-sm leading-relaxed text-blue-100/90 lg:block">
                        Empowering the Sangguniang Bayan with efficient data management and legislative transparency.
                    </p>
                </div>
            </div>

            {/* Right column: Form card — 50% on desktop */}
            <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:w-1/2 lg:flex-none lg:px-12 xl:px-16">
                <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none sm:p-8">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                {title}
                            </h1>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
