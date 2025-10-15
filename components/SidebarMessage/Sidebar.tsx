"use client";

import { Button } from "@/components/Button";
import { Box, Drawer, Toolbar } from "@mui/material";
import { SearchBoxComponent } from "../SearchBox/SearchBox";
import "./index.css";

const Sidebar = () => {
    const WIDTH = 350;

    return (
        <Box className="sidebarWrapper">
            <Drawer
                className="custom-drawer"
                variant="permanent"
                anchor="left"
                sx={{ flex: "0 0 auto" }}
                PaperProps={{
                    sx: {
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: WIDTH,
                        height: "100vh",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        borderRight: "1px solid #eee",


                        borderRadius: "16px 16px 16px 0",
                        margin: 0,
                        zIndex: (theme) => theme.zIndex.drawer,
                        backgroundColor: "#343a40",
                    },
                }}
            >
                <Toolbar className="toolbar">
                    <div className="toolbar inner">
                        <div aria-label="logo-group">
                            <img
                                src="/logo_padrao_horizontal.png"
                                className="weconecta-logo"
                                alt="WeConecta"
                            />
                        </div>
                    </div>
                </Toolbar>


                <SearchBoxComponent />

                <Box sx={{ p: 2, mt: "auto", mb: 2 }}>
                    <Button>Nova Mensagem</Button>
                </Box>
            </Drawer>
        </Box>
    );
};

export default Sidebar;
