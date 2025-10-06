'use client';

import { Menu } from '@mui/icons-material';
import { Box, Drawer, Toolbar } from '@mui/material';
import './index.css';

const Sidebar = ({
    children,
    sidebarOpen,
    setSidebarOpen,
}: {
    children: React.ReactNode;
    sidebarOpen: boolean;
    setSidebarOpen: any;
}) => {
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
                <Toolbar className='toolbar' style={{ height: '90px' }}>
                    <div className='toolbar inner' style={{ height: '90px' }}>
                        {sidebarOpen ? (
                            <div aria-label='logo-group'>
                                <img
                                    src='/logo_padrao_horizontal.png'
                                    className='weconecta-logo'
                                />
                            </div>
                        ) : (
                            ''
                        )}
                        <Menu
                            className='hamburguer toggle-btn'
                            onClick={() => setSidebarOpen((prev: any) => !prev)}
                            fontSize='small'
                        />
                    </div>
                </Toolbar>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        <FilterBox>
                            {children}
                        </FilterBox>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

const FilterBox = ({
    children,
}: {
    children: React.ReactNode;
}) => {

    return (
        <div
            className='menuItemWrapper'
        >
            {children}
        </div>
    );
};

export default Sidebar;
