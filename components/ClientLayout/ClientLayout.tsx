"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "../../dtos/UserDto";
import { useAuth } from "../../providers/Auth/AuthProvider";
import { useRoute } from "../../providers/Route/RouteProvider";
import "./index.css";


function PageName() {
    const { currentPage } = useRoute();

    return (
        <div className="page-name-header">
            <h1>{currentPage?.name || "Página"}</h1>
        </div>
    )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, isLogged, logout } = useAuth();
    const { currentPage } = useRoute();
    const router = useRouter();

    useEffect(() => {
        // Só verifica autenticação se a página requer autenticação
        // Não chama logout() aqui para evitar chamadas desnecessárias à API
        // Se não há usuário nem token, apenas redireciona
        if (currentPage?.requireAuth && !user && !isLogged()) {
            router.push('/login');
        }
    }, [user, isLogged, currentPage, router])

    // Se a página requer autenticação mas o usuário não está logado, aguarda carregar
    if (currentPage?.requireAuth && !user && !isLogged()) {
        return <></>;
    }

    // Se há usuário e a página requer roles específicos, verifica permissão
    // Isso deve ser verificado ANTES de renderizar o layout, mesmo para páginas sem sidebar
    if (user && currentPage?.requireRoles && currentPage.requireRoles.length > 0) {
        if (!currentPage.requireRoles.includes(user.role as UserRole)) {
            const handleBack = async () => {
                // Faz logout e redireciona para login
                // Como o usuário está logado (chegou neste ponto), sempre faz logout
                await logout();
            };

            return (
                <div className="layout-container">
                    <main className="main-content">
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            minHeight: '100vh',
                            gap: '1rem',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333', margin: 0 }}>
                                Acesso negado
                            </h2>
                            <p style={{ fontSize: '1rem', color: '#666', margin: 0, textAlign: 'center' }}>
                                Você não tem permissão para acessar essa página.
                            </p>
                            <button
                                id="back-to-login-btn"
                                onClick={handleBack}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    color: '#fff',
                                    backgroundColor: '#0c8bfc',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease',
                                    marginTop: '1rem'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#0a7ae0';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#0c8bfc';
                                }}
                            >
                                Voltar para Login
                            </button>
                        </div>
                    </main>
                </div>
            );
        }
    }

    // Se a página não requer sidebar, renderiza apenas o conteúdo
    if (currentPage && !currentPage?.sidebarEnabled) {
        return (
            <div className="layout-container">
                <main className="main-content">{children}</main>
            </div>
        );
    }

    // Se não há usuário e a página requer sidebar, aguarda carregar
    if (!user && currentPage?.sidebarEnabled) {
        return <></>;
    }

    return (
        <div className="layout-container">
            <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </aside>
            <div className="w-full">
                <main className="layout-container-right">
                    {!currentPage?.topbarDisabled && <PageName />}

                    <div className="w-full ">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
