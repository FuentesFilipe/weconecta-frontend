import { Loader } from '@/components/Loader'
import { UserProfileDto } from '@/dtos/UserDto'
import { getAuthToken, removeAuthToken, setAuthToken as setStoreAuthToken } from '@/utils/stores/auth'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface AuthProviderProps {
    user: UserProfileDto | null
    isLogged: (() => boolean)
    setAuthToken: ((token?: string) => void)
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
        const storageToken = getAuthToken()
        if (storageToken) setToken(storageToken)
    }, [])

    useEffect(() => {
        if (token) {
            const decoded = jwtDecode(token) as UserProfileDto
            setUser({ ...decoded })
        } else {
            setUser(null)
        }
    }, [token])

    const isLogged = () => !!getAuthToken()

    const setAuthToken = (token?: string) => {

        setToken(token)
        if (token) {
            setStoreAuthToken(token)
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
