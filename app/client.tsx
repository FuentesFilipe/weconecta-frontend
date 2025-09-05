// app/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';

import { ClientLayout } from '@/components/ClientLayout';
import { Toast } from '@/components/ui';
import { coreApi } from '@/services/core';
import { queryClient } from '@/services/query-client';
import { removeAuthToken } from '@/utils/stores/auth';

function QueryClient({ children }: { children: React.ReactNode }) {
    coreApi.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error: unknown) => {
            if (error instanceof AxiosError && error.response?.status === 401) {
                removeAuthToken();
                window.location.href = '/login';
            }
            return Promise.reject(error instanceof Error ? error : new Error('Unknown error'));
        }
    );

    return (
        <div>
            <ClientLayout>
                {children}
            </ClientLayout>
        </div>
    );
}

export function Client({ children }: { children: React.ReactNode }) {
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <Toast />
                <QueryClient children={children} />
            </QueryClientProvider>
        </React.StrictMode>
    );
}
