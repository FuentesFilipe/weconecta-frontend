import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import { Client } from './client';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'WeConecta',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`custom-body ${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
                <Client>{children}</Client>
            </body>
        </html>
    );
}
