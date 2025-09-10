import { TextField } from '@mui/material';
import { ChangeEventHandler } from 'react';
import './index.css';

export type ButtonProps = {
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
    disabled?: boolean;
    placeholder: string;
    minRows?: number;
};

export function TextAreaComponent({ placeholder, disabled = false, onChange, minRows = 3 }: ButtonProps) {
    return (
        <TextField
            id="outlined-password-input"
            className="custom-input"
            label={placeholder}
            disabled={disabled}
            onChange={onChange}
            type={'text'}
            multiline
            minRows={minRows}
        />
    );
}
