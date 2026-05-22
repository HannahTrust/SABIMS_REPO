import AppLogoIcon from '@/components/app-logo-icon';
import { usePage } from '@inertiajs/react';

export type Branding = {
    system_name?: string;
    module_name?: string | null;
    logo_url?: string | null;
};

type Props = {
    size?: 'sm' | 'md' | 'lg';
    showSubtitle?: boolean;
    className?: string;
    iconClassName?: string;
};

const sizeMap = {
    sm: { box: 'size-8', icon: 'size-5', title: 'text-sm', subtitle: 'text-[10px]' },
    md: { box: 'size-10', icon: 'size-6', title: 'text-base', subtitle: 'text-xs' },
    lg: { box: 'h-24 w-24 sm:h-28 sm:w-28', icon: 'h-12 w-12 sm:h-14 sm:w-14', title: 'text-2xl sm:text-3xl', subtitle: 'text-sm' },
};

export function useBranding(): Branding {
    const { branding } = usePage().props as { branding?: Branding };

    return {
        system_name: branding?.system_name ?? 'eBarangayHub',
        module_name: branding?.module_name ?? 'SABIMS Module',
        logo_url: branding?.logo_url ?? null,
    };
}

export default function BrandingLogo({ size = 'sm', showSubtitle = true, className = '', iconClassName = '' }: Props) {
    const branding = useBranding();
    const s = sizeMap[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                className={`flex ${s.box} shrink-0 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground`}
            >
                {branding.logo_url ? (
                    <img src={branding.logo_url} alt="" className="h-full w-full object-contain p-0.5" />
                ) : (
                    <AppLogoIcon className={`${s.icon} fill-current text-white dark:text-black ${iconClassName}`} />
                )}
            </div>
            <div className="grid text-left leading-tight">
                <span className={`truncate font-semibold ${s.title}`}>{branding.system_name}</span>
                {showSubtitle && branding.module_name ? (
                    <span
                        className={`truncate font-medium uppercase tracking-wider text-sidebar-foreground/60 ${s.subtitle}`}
                    >
                        {branding.module_name}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
