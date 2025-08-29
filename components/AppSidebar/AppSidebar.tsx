import { CircleUser, TrendingUp, Calendar, Home, icons, Inbox, Search, Settings, Users, FileUser } from 'lucide-react';

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import './index.css';

// export type AppSidebarProps = {
//     children: React.ReactNode;
// };

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

const user = {
    name: "Usuário",
    email: "exemplo@exemplo.com",
    icon: CircleUser,
}

export function AppSidebarComponent() {
    return (
        <Sidebar className='app-sidebar'>
            <SidebarHeader>
                <img src='https://weconecta.com/wp-content/uploads/2024/02/WeConecta-logo-icon.png' className='weconecta-logo' />
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
                <div className="weconecta-sidebar-user">
                    <user.icon className="weconecta-sidebar-user-avatar" />
                    <div className="weconecta-sidebar-user-info">
                        <span className="weconecta-sidebar-user-name"> {user.name} </span>
                        <span className="weconecta-sidebar-user-email"> {user.email} </span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
