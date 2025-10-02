'use client';

import { PAGES } from '@/providers/Route/pages';
import { Menu } from '@mui/icons-material';
import { Box, Drawer, List, Toolbar, Typography } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import './index.css';
import { UserIcon } from 'lucide-react';

const Sidebar = ({
    sidebarOpen,
    setSidebarOpen,
    user = { name: "Administrador", email: "weconecta@weconecta.com", icon: UserIcon },
}: {
    sidebarOpen: boolean;
    setSidebarOpen: any;
    user?: { name: string; email: string; icon: any };
}) => {
    const pathname = usePathname();
    const Icon = user.icon;
    return (
        <Box className='sidebarWrapper'>
            <Drawer
                className='custom-drawer'
                variant='permanent'
                sx={{
                    flex: 1,
                    [`& .MuiDrawer-paper`]: {
                        position: 'relative',
                        backgroundColor: '#fff',
                        color: '#4c4c4c !important',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                <Toolbar className='toolbar'>
                    <div className={`toolbar-inner ${!sidebarOpen ? 'closed' : ''}`}>
                        {sidebarOpen && (
                            <div className='logo-container'>
                                <img
                                    src='/logo_padrao_horizontal.png'
                                    className='weconecta-logo'
                                    alt='WeConnecta Logo'
                                />
                            </div>
                        )}
                        <Menu
                            className='hamburguer-icon'
                            onClick={() => setSidebarOpen((prev: any) => !prev)}
                            fontSize='medium'
                        />
                    </div>
                </Toolbar>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, overflow: 'auto', paddingTop: '1rem' }}>
                    <List sx={{ padding: 0 }}>
                        {PAGES.map((PAGE) => {
                            if (PAGE.sidebarEnabled === false)
                                return <div key={PAGE.path}></div>;
                            return (
                                <MenuItem
                                    key={PAGE.path}
                                    icon={PAGE.icon}
                                    href={PAGE.path}
                                    text={PAGE.name}
                                    active={pathname === PAGE.path}
                                    sidebarOpen={sidebarOpen}
                                />
                            );
                        })}
                    </List>
                </Box>

                <Box className={`weconecta-sidebar-footer ${!sidebarOpen ? 'closed' : ''}`} sx={{ mt: 'auto' }}>
                    <div className='weconecta-sidebar-user'>
                        <Icon className='weconecta-sidebar-user-avatar' />
                        {sidebarOpen && (
                            <div className='weconecta-sidebar-user-info'>
                                <Typography className='weconecta-sidebar-user-name' sx={{ color: '#333' }}>
                                    {user.name}
                                </Typography>
                                <Typography className='weconecta-sidebar-user-email' sx={{ color: '#777', fontSize: 14 }}>
                                    {user.email}
                                </Typography>
                            </div>
                        )}
                    </div>
                </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

const MenuItem = ({
    icon,
    text,
    href,
    active = false,
    sidebarOpen,
}: {
    icon: React.ReactNode;
    text: string;
    href: string;
    active?: boolean;
    sidebarOpen: boolean;
}) => {
    const router = useRouter();

    return (
        <div
            className={`menuItemWrapper ${!sidebarOpen ? 'closed' : ''}`}
            aria-checked={active}
            onClick={() => router.push(href)}
        >
            <Box className={`menuItem ${active ? 'active' : ''} ${!sidebarOpen ? 'closed' : ''}`}>
                <Box
                    className='menuIcon'
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: active ? '#0c8bfc' : '#4c4c4c',
                    }}
                >
                    {icon}
                </Box>
                {sidebarOpen && (
                    <Typography
                        variant='body1'
                        className={`menuText ${active ? 'active' : ''}`}
                        sx={{ fontSize: 18, fontWeight: 500 }}
                    >
                        {text}
                    </Typography>
                )}
            </Box>
        </div>
    );
};

export default Sidebar;
