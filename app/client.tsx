// app/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';

import { ClientLayout } from '@/components/ClientLayout';
import { Toast } from '@/components/ui';
import { coreApi } from '@/services/core';
import { queryClient } from '@/services/query-client';
import { AuthProvider, useAuth } from '../providers/Auth/AuthProvider';
import { RouteProvider } from '../providers/Route/RouteProvider';

function QueryClient({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth();

    coreApi.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error: unknown) => {
            if (error instanceof AxiosError && error.response?.status === 401) {
                logout();
            }
            return Promise.reject(error instanceof Error ? error : new Error('Unknown error'));
        }
    );

    return (
        <main>
            <ClientLayout>
                {children}
            </ClientLayout>
        </main>
    );
}

export function Client({ children }: { children: React.ReactNode }) {
    return (
        <React.StrictMode>
            <RouteProvider>
                <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                        <Toast />
                        <QueryClient children={children} />
                    </QueryClientProvider>
                </AuthProvider>
            </RouteProvider>
        </React.StrictMode>
    );
}
