'use client';

import { Button } from '../../components/Button';
import './index.css';

export default function Login() {
    const onClick: VoidFunction = () => {
        console.warn('Button clicked!');
    };

    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div className="custom-login p-10">
                    <p>Example Login</p>
                    <Button onClick={onClick} disabled={false}>
                        Login
                    </Button>
                </div>
            </main>
        </div>
    );
}
