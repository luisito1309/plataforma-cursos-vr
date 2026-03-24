import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, Home, LayoutGrid, Library, User } from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
import { dashboard, home } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import type { NavItem } from '@/types';
import type { UserRole } from '@/types/auth';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

function getMainNavItems(role: UserRole | undefined): NavItem[] {
    if (role === 'admin') {
        return [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            { title: 'Cursos', href: '/cursos', icon: BookOpen },
        ];
    }
    return [
        { title: 'Home', href: home(), icon: Home },
        { title: 'Cursos', href: '/cursos', icon: BookOpen },
        { title: 'Mis Cursos', href: '/mis-cursos', icon: Library },
        { title: 'Perfil', href: profileEdit(), icon: User },
    ];
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = (auth?.user as { role?: UserRole } | null)?.role ?? 'estudiante';
    const mainNavItems = getMainNavItems(role);
    const logoHref = role === 'admin' ? dashboard() : home();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={logoHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
