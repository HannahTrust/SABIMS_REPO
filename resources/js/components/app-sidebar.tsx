import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    ClipboardList,
    FileText,
    Landmark,
    LayoutGrid,
    Shield,
    Users,
    UsersRound,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Committees',
        href: '/committees',
        icon: Users,
    },
    {
        title: 'Sessions',
        href: '/sessions',
        icon: Calendar,
    },
    {
        title: 'Resolutions',
        href: '/resolutions',
        icon: FileText,
    },
    {
        title: 'Ordinances',
        href: '/ordinances',
        icon: FileText,
    },
    {
        title: 'Residents',
        href: '/residents/dashboard',
        icon: UsersRound,
    },
    {
        title: 'Business Registry',
        href: '/business-registry/dashboard',
        icon: Building2,
    },
    {
        title: 'Blotter',
        href: '/blotter-reports',
        icon: ClipboardList,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Shield,
    },
    {
        title: 'Barangay',
        href: '/management/barangays',
        icon: Landmark,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { auth, census, business_registry } = usePage().props as {
        auth?: { user?: { role?: string | null } };
        census?: { can_view?: boolean };
        business_registry?: { can_view?: boolean };
    };
    const role = (auth?.user?.role ?? '').toString().toLowerCase();
    const canManageUsers = role === 'super_admin';
    const canAccessBarangayManagement = role === 'super_admin' || role === 'brgy_admin';
    const canViewResidents = census?.can_view === true;
    const canViewBusinessRegistry = business_registry?.can_view === true;

    const items = mainNavItems.filter((i) => {
        if (i.href === '/users' && !canManageUsers) {
            return false;
        }
        if (i.href === '/management/barangays' && !canAccessBarangayManagement) {
            return false;
        }
        if (i.href === '/residents/dashboard' && !canViewResidents) {
            return false;
        }
        if (i.href === '/business-registry/dashboard' && !canViewBusinessRegistry) {
            return false;
        }

        return true;
    });

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="[&_[data-sidebar=sidebar]]:bg-gradient-to-b [&_[data-sidebar=sidebar]]:from-slate-50 [&_[data-sidebar=sidebar]]:to-white [&_[data-sidebar=sidebar]]:shadow-xl [&_[data-sidebar=sidebar]]:shadow-slate-200/60 dark:[&_[data-sidebar=sidebar]]:from-slate-950 dark:[&_[data-sidebar=sidebar]]:to-slate-900 dark:[&_[data-sidebar=sidebar]]:shadow-black/30"
        >
            <SidebarHeader className="border-b border-sidebar-border/60 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="rounded-xl px-3">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3">
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 p-3">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
