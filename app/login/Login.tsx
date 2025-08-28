'use client';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '../../components/Button';
import './index.css';
import { AppSidebar } from '@/components/AppSidebar';

export default function Login() {
    const onClick: VoidFunction = () => {
        console.warn('Button clicked!');
    };

    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <SidebarProvider>
                <AppSidebar></AppSidebar>
                <main>
                    <SidebarTrigger />
                </main>
            </SidebarProvider>
        </div>
    );
}
