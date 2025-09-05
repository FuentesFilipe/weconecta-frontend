'use client';

import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter } from 'next/navigation';
import { ChangeEventHandler, useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AuthPayload } from '@/dtos/AuthDto';
import { useLoginMutation } from '@/services/auth/login/mutations';

import { Loading } from '@/components/ui/';
import { setAuthToken } from '@/utils/stores/auth';
import { toast } from 'react-toastify';
import './index.css';

export default function Login() {
    const router = useRouter();

    const [form, setForm] = useState<AuthPayload>({
        email: '',
        password: ''
    });
    const [disabled, setDisabled] = useState<boolean>(false);

    const { mutate: login, data: loginData } = useLoginMutation(form);

    const handleClick = () => {
        setDisabled(true);

        login();

        setTimeout(() => {
            setDisabled(false);
        }, 1000);
    };

    useEffect(() => {
        if (loginData && loginData.accessToken) {
            setAuthToken(loginData.accessToken);
            toast.success('Login realizado com sucesso!');
            router.push('/');
        }
    }, [loginData]);

    const onEmailChange: ChangeEventHandler<HTMLInputElement> | undefined = (e) => {
        setForm((prev) => ({
            ...prev,
            email: e.target.value
        }));
    };

    const onPasswordChange: ChangeEventHandler<HTMLInputElement> | undefined = (e) => {
        setForm((prev) => ({
            ...prev,
            password: e.target.value
        }));
    };

    return (
        <div className='font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
            <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
                <div className='custom-login'>
                    <div aria-label='logo-group'>
                        <img src='/logo_padrao_horizontal.png' className='weconecta-logo' />
                    </div>
                    <div aria-label='input-group'>
                        <h2 className='text-2xl font-bold text-gray-500 mr-2'>Log in</h2>
                        <div>
                            <Input onChange={onEmailChange} placeholder='Email' type='email' icon={<PersonIcon />} />
                        </div>
                        <div>
                            <Input onChange={onPasswordChange} placeholder='Senha' type='password' icon={<LockIcon />} />
                        </div>
                        <div>
                            <span className='custom-hiperlink'>Esqueci a senha!</span>
                        </div>
                    </div>
                    <div aria-label='button-group'>
                        {disabled ? <Loading /> :
                            <Button disabled={disabled} onClick={handleClick}>
                                <span>Log In</span>
                            </Button>
                        }
                    </div>
                </div>
            </main>
        </div>
    );
}
