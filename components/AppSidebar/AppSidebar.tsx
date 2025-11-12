'use client';

import { CircleUser, TrendingUp, Users, FileUser, LogOut } from 'lucide-react';

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import { useAuth } from '@/providers/Auth/AuthProvider';
import { UserRole } from '@/dtos/UserDto';
import './index.css';

const items = [
    {
        title: 'Métricas',
        url: '/metricas',
        icon: TrendingUp,
        color: "#4d4d4d"
    },
    {
        title: 'Usuários',
        url: '/usuarios',
        icon: Users,
        color: "#4d4d4d"
    },
    {
        title: 'Questionários',
        url: '/questionarios',
        icon: FileUser,
        color: "#4d4d4d"
    }
];

export function AppSidebarComponent() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const getUserRoleLabel = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'Administrador';
            case UserRole.COLLABORATOR:
                return 'Colaborador';
            default:
                return 'Usuário';
        }
    };

    return (
        <Sidebar className='app-sidebar'>
            <SidebarHeader className="weconecta-sidebar-header">
                <img src='/logo_padrao_horizontal.png' className='weconecta-logo' />
            </SidebarHeader>
            <SidebarContent className="weconecta-sidebar-content">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title} className="weconecta-sidebar-menu-item">
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="weconecta-sidebar-link">
                                            <item.icon style={{ color: item.color }} className="weconecta-sidebar-menu-icon" />
                                            <span className="weconecta-sidebar-text"> {item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter className="weconecta-sidebar-footer">
                <div className="weconecta-sidebar-user-section">
                    <div className="weconecta-sidebar-user">
                        <CircleUser className="weconecta-sidebar-user-avatar" />
                        <div className="weconecta-sidebar-user-info">
                            <span className="weconecta-sidebar-user-name">
                                {user?.friendlyName || 'Usuário'}
                            </span>
                            <span className="weconecta-sidebar-user-email">
                                {user?.role ? getUserRoleLabel(user.role) : 'Carregando...'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="weconecta-sidebar-logout-button"
                        title="Sair"
                    >
                        <LogOut className="weconecta-sidebar-logout-icon" />
                        <span className="weconecta-sidebar-logout-text">Sair</span>
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
