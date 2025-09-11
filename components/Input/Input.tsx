import { InputAdornment, TextField } from '@mui/material';
import { ChangeEventHandler } from 'react';
import './index.css';

export type ButtonProps = {
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
    disabled?: boolean;
    placeholder: string;
    type?: 'password' | 'text' | 'email' | 'number';
    icon?: React.ReactNode;
};

function Icon({ children }: { children: React.ReactNode }) {
    console.log(children);
    return (
        <InputAdornment position="start">
            {children}
        </InputAdornment>
    )
}

export function InputComponent({ type = 'text', placeholder, disabled = false, onChange, icon }: ButtonProps) {
    return (
        <TextField
            id="outlined-password-input"
            className="custom-input"
            label={placeholder}
            slotProps={{
                input: {
                    startAdornment: (
                        icon && <Icon>{icon}</Icon>
                    ),
                },
            }}
            disabled={disabled}
            onChange={onChange}
            type={type}
        />
    );
}
