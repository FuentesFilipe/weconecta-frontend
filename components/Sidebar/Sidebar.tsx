"use client";

import { PAGES } from "@/providers/Route/pages";
import { Menu } from "@mui/icons-material";
import { Box, Drawer, List, Toolbar, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import "./index.css";

const Sidebar = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: any }) => {
    const pathname = usePathname();
    return (
        <Box className="sidebarWrapper">
            <Drawer
                className="custom-drawer"
                variant="permanent"
                sx={{
                    flex: 1,
                    [`& .MuiDrawer-paper`]: {
                        position: "relative",
                        backgroundColor: "#fff",
                        color: "4c4c4c",
                    },
                }}
            >
                <Toolbar className="toolbar">
                    <div className="toolbar inner">
                        {sidebarOpen ? (
                            <div aria-label='logo-group'>
                                <img src='/logo_padrao_horizontal.png' className='weconecta-logo' />
                            </div>
                        ) : (
                            ""
                        )}
                        <Menu
                            className="hamburguer toggle-btn"
                            onClick={() => setSidebarOpen((prev: any) => !prev)}
                            fontSize="small"
                        />
                    </div>
                </Toolbar>
                <Box sx={{ overflow: "auto" }}>
                    <List>
                        {PAGES.map((PAGE) => {
                            if (PAGE.sidebarEnabled === false) return <div key={PAGE.path}></div>;
                            return (
                                <MenuItem
                                    key={PAGE.path}
                                    icon={PAGE.icon}
                                    href={PAGE.path}
                                    text={PAGE.name}
                                    active={pathname === PAGE.path}
                                    sidebarOpen={sidebarOpen}
                                />
                            )
                        })}
                    </List>
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
        <div className="menuItemWrapper" aria-checked={active} onClick={() => router.push(href)}>
            <Box className={`menuItem ${active ? "active" : "closed"}`}>
                <Box sx={{ display: "flex", alignItems: "center", color: active ? "#0c8bfc" : "#4c4c4c" }}>{icon}</Box>
                {sidebarOpen && (
                    <Typography variant="body1" className={`menuText ${active ? "active" : "closed"}`} sx={{ fontSize: 18, fontWeight: 500 }}>
                        {text}
                    </Typography>
                )}
            </Box>
        </div>
    );
};

export default Sidebar;
