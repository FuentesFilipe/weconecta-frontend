import { Button } from '../ui';
import styles from './index.css';

export type ButtonProps = {
    onClick?: VoidFunction;
    disabled?: boolean;
    children: React.ReactNode;
};

export function ButtonComponent({ onClick, disabled = false, children }: ButtonProps) {
    return (
        <Button variant='orange' size='wide' onClick={onClick} disabled={disabled}>
            {children}
        </Button>
    );
}
