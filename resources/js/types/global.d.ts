import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            branding: {
                id: number | null;
                code: string | null;
                name: string | null;
                municipality_name: string | null;
                system_name: string;
                module_name: string | null;
                logo_url: string | null;
            };
            capabilities: {
                is_platform_admin: boolean;
                is_municipal_admin: boolean;
                can_manage_tenants: boolean;
                can_manage_municipality_branding: boolean;
            };
            auth: Auth;
            notifications: Array<{
                id: string;
                type: string;
                data: Record<string, unknown>;
                read_at: string | null;
                created_at: string;
            }>;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
