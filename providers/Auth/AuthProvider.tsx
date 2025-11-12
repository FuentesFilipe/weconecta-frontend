import { Loader } from '@/components/Loader'
import { UserProfileDto, UserRole } from '@/dtos/UserDto'
import { logoutApi } from '@/services/auth/logout'
import { STORE_KEYS } from '@/utils/contants/stores'
import { getAuthToken, removeAuthToken, setAuthToken as setStoreAuthToken } from '@/utils/stores/auth'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface AuthProviderProps {
    user: UserProfileDto | null
    isLogged: (() => boolean)
    setAuthToken: ((token?: string, rememberMe?: boolean) => void)
    logout: (() => Promise<void>)
    removeAuthToken: (() => void)
}

const AuthContext = createContext<AuthProviderProps>({
    user: null,
    isLogged: () => false,
    setAuthToken: () => { },
    logout: async () => { },
    removeAuthToken: () => { }
})

const AuthProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfileDto | null>(null)
    const [token, setToken] = useState<string | undefined>()
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem(STORE_KEYS.token);
        if (token) {
            setAuthToken(token);
        }
    }, []);


    useEffect(() => {
        if (token) {
            const decoded = jwtDecode(token) as UserProfileDto & { role: string }
            // Mapeia MEMBER (backend) para COLLABORATOR (frontend) para manter compatibilidade
            const mappedRole = decoded.role === 'MEMBER' ? UserRole.COLLABORATOR : decoded.role as UserRole
            setUser({ ...decoded, role: mappedRole })
        } else {
            setUser(null)
        }
    }, [token])

    const isLogged = () => !!getAuthToken()

    const setAuthToken = (token?: string, rememberMe?: boolean) => {
        setToken(token)
        if (token) {
            setStoreAuthToken(token, rememberMe)
        } else {
            removeAuthToken()
        }
    }

    const logout = async () => {
        const token = getAuthToken();
        
        // Se houver token, tenta chamar a API de logout
        if (token) {
            try {
                await logoutApi.post('/logout');
                // Não mostra toast de sucesso aqui para evitar spam quando é chamado automaticamente
            } catch (error: any) {
                // Ignora erros 401 (token inválido/expirado) e 404 (rota não encontrada) pois já estamos fazendo logout
                // Ignora outros erros também, pois vamos fazer logout local de qualquer forma
                const status = error?.response?.status;
                if (status !== 401 && status !== 404) {
                    console.error('Erro ao fazer logout no servidor:', error);
                }
            }
        }
        
        // Sempre limpa o token e redireciona, mesmo se não houver token ou se a API falhar
        setToken('')
        removeAuthToken()
        router.push('/login');
    }

    const value = {
        user,
        isLogged,
        setAuthToken,
        logout,
        removeAuthToken,
    }

    return (
        <AuthContext.Provider value={value}>
            {user || !isLogged() ? children : <Loader />}
        </AuthContext.Provider>
    )
}

export { AuthProvider }

export function useAuth() {
    return useContext(AuthContext)
}
