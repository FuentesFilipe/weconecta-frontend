"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UserRole } from "../../dtos/UserDto";
import { useAuth } from "../../providers/Auth/AuthProvider";
import { useRoute } from "../../providers/Route/RouteProvider";
import "./index.css";


function PageName() {
    const { currentPage } = useRoute();

    return (
        <div className="py-4 border-b border-gray-200 w-full px-4">
            <h1 className="text-2xl font-semibold text-gray-800">{currentPage?.name || "Página"}</h1>
        </div>
    )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { currentPage } = useRoute();

    useEffect(() => {
        if (currentPage?.requireAuth && !user) {
            toast.warning('Você precisa estar logado para acessar essa página.');
            logout();
        }
    }, [user])

    if (currentPage && !currentPage?.sidebarEnabled) {
        return (
            <div className="layout-container">
                <main className="main-content">{children}</main>
            </div>
        );
    }

    if (!user) {
        return <></>;
    }

    if (currentPage?.requireRoles.length && !currentPage?.requireRoles.includes(user?.role as UserRole)) {
        return <div>Você não tem permissão para acessar essa página.</div>;
    }

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </aside>
            {/* Main content */}
            <div className="w-full p-2">
                {/* Conteúdo principal */}
                <main className="flex-1 bg-gray-50 flex flex-col items-start overflow-y-auto">
                    {/* Cabeçalho da página - não mostrar se a página tem seu próprio cabeçalho */}
                    {currentPage?.path !== '/questionarios/criacao' && <PageName />}
                    <div className="w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div >
    );
}
