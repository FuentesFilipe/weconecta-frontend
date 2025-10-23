import { Loader } from '@/components/Loader'
import { usePathname } from 'next/navigation'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { Page, PAGES } from './pages'

interface RouteProviderProps {
    currentPage: Page | null,
    setCurrentPage: (page: Page | null) => void
}

const RouteContext = createContext<RouteProviderProps>({
    currentPage: null,
    setCurrentPage: () => { },
})

const RouteProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState<Page | null>(null)
    const pathname = usePathname()


    useEffect(() => {
        setCurrentPage(PAGES.find(page => page.path === pathname) || null)
    }, [pathname])

    const value = {
        currentPage,
        setCurrentPage
    }

    return (
        <RouteContext.Provider value={value}>
            {currentPage ? children : <Loader />}
        </RouteContext.Provider>
    )
}

export { RouteProvider }

export function useRoute() {
    return useContext(RouteContext)
}
