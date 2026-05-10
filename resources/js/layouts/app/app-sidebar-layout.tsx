import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { cn } from '@/lib/utils';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    contentWide = false,
    contentSectionClassName,
    contentCardClassName,
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="overflow-x-hidden bg-slate-50/60 dark:bg-slate-950/40"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <section
                    className={cn(
                        contentWide
                            ? 'flex w-full min-w-0 flex-1 flex-col px-4 py-5 md:px-6 md:py-6'
                            : 'mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 md:px-6 md:py-6',
                        contentSectionClassName,
                    )}
                >
                    <div
                        className={cn(
                            'flex-1 rounded-2xl border border-slate-200/80 bg-background/90 p-4 shadow-sm backdrop-blur-sm md:p-6 dark:border-slate-800/80',
                            contentCardClassName,
                        )}
                    >
                        {children}
                    </div>
                </section>
            </AppContent>
        </AppShell>
    );
}
