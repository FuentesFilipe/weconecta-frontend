import { Button } from '@mui/material';
import './index.css';

export type ButtonProps = {
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
};

export function ButtonComponent({ onClick, disabled = false, children, title }: ButtonProps) {
    return (
        <Button className='custom-icon-button' onClick={onClick} disabled={disabled} title={title}>
            {children}
        </Button>
    );
}
