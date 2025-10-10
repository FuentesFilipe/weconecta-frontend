import { UserRole } from '@/dtos/UserDto';
import { HomeFilled } from '@mui/icons-material';
import { BarChart, FileText, Palette, Users } from 'lucide-react';
import { JSX } from 'react';

export type Page = {
    path: string;
    sidebarEnabled: boolean;
    requireRoles: UserRole[];
    requireAuth: boolean;
    name: string;
    icon?: JSX.Element;
    topbarDisabled?: boolean;
}

export const PAGES: Page[] = [
    {
        path: '/',
        sidebarEnabled: true,
        requireRoles: [UserRole.ADMIN],
        requireAuth: true,
        name: 'Dashboard',
        icon: <HomeFilled className='sidebar-icon' />,
    },
    {
        path: '/metricas',
        sidebarEnabled: false,
        requireRoles: [UserRole.ADMIN],
        requireAuth: true,
        name: 'Métricas',
        icon: <BarChart className='sidebar-icon' />,
    },
    {
        path: '/login',
        sidebarEnabled: false,
        requireRoles: [],
        requireAuth: false,
        name: 'Login',
    },
    {
        path: '/teste',
        sidebarEnabled: false,
        requireRoles: [],
        requireAuth: false,
        name: 'Página de Teste',
    },
    {
        path: '/questionarios',
        sidebarEnabled: true,
        requireRoles: [UserRole.ADMIN],
        requireAuth: false,
        name: 'Questionários',
        icon: <FileText className='sidebar-icon' />,
    },
    {
        path: '/questionarios/canva',
        sidebarEnabled: true,
        topbarDisabled: true,
        requireRoles: [UserRole.ADMIN],
        requireAuth: false,
        name: 'Canva',
        icon: <Palette className='sidebar-icon' />,
    },

    {
        path: '/membros',
        sidebarEnabled: true,
        requireRoles: [UserRole.ADMIN],
        requireAuth: true,
        name: 'Membros',
        icon: <Users className='sidebar-icon' />,
    },
];
