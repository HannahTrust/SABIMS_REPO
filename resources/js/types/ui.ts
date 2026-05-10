import type { ReactNode } from 'react';
import type { BreadcrumbItem } from './navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    /** Use full width of the main column (no max-w-7xl). Includes horizontal padding. */
    contentWide?: boolean;
    contentSectionClassName?: string;
    contentCardClassName?: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};
