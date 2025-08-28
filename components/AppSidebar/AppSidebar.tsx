import { TrendingUp, Calendar, Home, icons, Inbox, Search, Settings, Users, FileUser } from 'lucide-react';

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import './index.css';

// export type AppSidebarProps = {
//     children: React.ReactNode;
// };

const items = [
    {
        title: 'Reports',
        url: '/reports',
        icon: TrendingUp
    },
    {
        title: 'Usuários',
        url: '/usuarios',
        icon: Users
    },
    {
        title: 'Questionários',
        url: '/questionarios',
        icon: FileUser
    }
];

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
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
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
            <SidebarFooter className="weconecta-sidebar-footer" />
        </Sidebar>
    );
}
