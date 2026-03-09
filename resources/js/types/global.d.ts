import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
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
