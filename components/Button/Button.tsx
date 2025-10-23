import { Button } from '@mui/material';
import './index.css';

export type ButtonProps = {
    onClick?: VoidFunction;
    disabled?: boolean;
    children: React.ReactNode;
};

export function ButtonComponent({ onClick, disabled = false, children }: ButtonProps) {
    return (
        <Button className='custom-button' onClick={onClick} disabled={disabled}>
            {children}
        </Button>
    );
}
