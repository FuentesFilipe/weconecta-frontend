import { Calendar, Home, icons, Inbox, Search, Settings, User } from 'lucide-react';

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import './index.css';

// export type AppSidebarProps = {
//     children: React.ReactNode;
// };

const items = [
    {
        title: 'Reports',
        url: '/reports',
        icon: Home
    },
    {
        title: 'Usuários',
        url: '/usuarios',
        icon: User
    },
    {
        title: 'Questionários',
        url: '/questionarios',
        icon: Inbox
    }
];

export function AppSidebarComponent() {
    return (
        <Sidebar className='app-sidebar'>
            <SidebarHeader>
                <img src='https://weconecta.com/wp-content/uploads/2024/02/WeConecta-logo-icon.png' className='weconecta-logo' />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    );
}
