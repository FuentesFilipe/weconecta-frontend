import { UserRole } from '@/dtos/UserDto';
import { HomeFilled } from '@mui/icons-material';
import { JSX } from 'react';

export type Page = {
    path: string;
    sidebarEnabled: boolean;
    requireRoles: UserRole[];
    requireAuth: boolean;
    name: string;
    icon?: JSX.Element;
}

export const PAGES: Page[] = [
    {
        path: '/',
        sidebarEnabled: true,
        requireRoles: [UserRole.ADMIN],
        requireAuth: true,
        name: 'Início',
        icon: <HomeFilled className='sidebar-icon' />,
    },
    {
        path: '/login',
        sidebarEnabled: false,
        requireRoles: [],
        requireAuth: false,
        name: 'Login',
    },
    {
        path: '/questionarios',
        sidebarEnabled: true,
        requireRoles: [UserRole.ADMIN],
        requireAuth: false,
        name: 'Questionários',
        icon: <HomeFilled className='sidebar-icon' />,
    },
];
