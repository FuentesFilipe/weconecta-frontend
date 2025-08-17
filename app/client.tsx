// app/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { queryClient } from '../services/query-client';

export function Client({ children }: { children: React.ReactNode }) {
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </React.StrictMode>
    );
}
