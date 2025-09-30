import { TextField } from '@mui/material';
import { ChangeEventHandler } from 'react';
import './index.css';

export type TextAreaProps = {
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
    disabled?: boolean;
    placeholder: string;
    minRows?: number;
    value?: string;
};

export function TextAreaComponent({ placeholder, disabled = false, onChange, minRows = 3, value }: TextAreaProps) {
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
            value={value}
        />
    );
}
