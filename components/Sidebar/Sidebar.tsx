"use client";

import { HomeFilled, Menu } from "@mui/icons-material";
import { Box, Drawer, List, Toolbar, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import "./index.css";

const getIconForLabel = (label: string, active: boolean): React.ReactNode => {
    const style = { color: active ? "#fff" : "#c2c7d0" };

    switch (label) {
        case "Home":
            return <HomeFilled sx={style} />;
        default:
            return null;
    }
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: any }) => {
    const pathname = usePathname();

    const links = [
        { label: "Home", href: "/" },
    ];

    return (
        <Box className="sidebarWrapper">
            <Drawer
                variant="permanent"
                sx={{
                    flex: 1,
                    [`& .MuiDrawer-paper`]: {
                        position: "relative",
                        backgroundColor: "#343a40",
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
                            className="toggle-btn"
                            onClick={() => setSidebarOpen((prev: any) => !prev)}
                            fontSize="small"
                        />
                    </div>
                </Toolbar>
                <Box sx={{ overflow: "auto" }}>
                    <List>
                        {links.map(({ label, href }) => (
                            <MenuItem
                                key={href}
                                icon={getIconForLabel(label, pathname === href)}
                                href={href}
                                text={label}
                                active={pathname === href}
                                sidebarOpen={sidebarOpen}
                            />
                        ))}
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
        <div className="menuItemWrapper" onClick={() => router.push(href)}>
            <Box className={`menuItem ${active ? "active" : "closed"}`}>
                <Box sx={{ display: "flex", alignItems: "center" }}>{icon}</Box>
                {sidebarOpen && (
                    <Typography variant="body1" className={`menuText ${sidebarOpen ? "active" : "closed"}`}>
                        {text}
                    </Typography>
                )}
            </Box>
        </div>
    );
};

export default Sidebar;
