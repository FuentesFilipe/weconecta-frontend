import { Loader } from '@/components/Loader'
import { UserProfileDto } from '@/dtos/UserDto'
import { STORE_KEYS } from '@/utils/contants/stores'
import { getAuthToken, removeAuthToken, setAuthToken as setStoreAuthToken } from '@/utils/stores/auth'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface AuthProviderProps {
    user: UserProfileDto | null
    isLogged: (() => boolean)
    setAuthToken: ((token?: string, rememberMe?: boolean) => void)
    logout: (() => void)
}

const AuthContext = createContext<AuthProviderProps>({
    user: null,
    isLogged: () => false,
    setAuthToken: () => { },
    logout: () => { }
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
            const decoded = jwtDecode(token) as UserProfileDto
            setUser({ ...decoded })
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

    const logout = () => {
        setToken('')
        removeAuthToken()
        router.push('/login');
    }

    const value = {
        user,
        isLogged,
        setAuthToken,
        logout
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
