import { InputAdornment, TextField } from '@mui/material';
import { ChangeEventHandler } from 'react';
import './index.css';

export type ButtonProps = {
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
    disabled?: boolean;
    placeholder: string;
    type?: 'password' | 'text' | 'email' | 'number';
    icon?: React.ReactNode;
    value?: string;
};

function Icon({ children }: { children: React.ReactNode }) {
    return (
        <InputAdornment position="start">
            {children}
        </InputAdornment>
    )
}

export function InputComponent({ type = 'text', placeholder, disabled = false, onChange, icon, value }: ButtonProps) {
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
            value={value}
        />
    );
}
