import { ChangeEventHandler } from 'react';

import { Input } from '../ui';
import './index.css';

export type ButtonProps = {
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
    disabled?: boolean;
    placeholder: string;
    type: string;
};

export function InputComponent({ type, placeholder, disabled = false, onChange }: ButtonProps) {
    return (
        <Input placeholder={placeholder} className="custom-input" disabled={disabled} onChange={onChange} type={type} />
    );
}
