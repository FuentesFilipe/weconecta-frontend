"use client";

import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import "./index.css";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </aside>
            {/* Main content */}
            <main className="main-content">{children}</main>
        </div>
    );
}
