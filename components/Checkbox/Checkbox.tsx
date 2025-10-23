import { Checkbox } from '@mui/material';
import './index.css';

export type CheckboxProps = {
    checked: boolean;
    onClick?: VoidFunction;
    disabled?: boolean;
    indeterminate?: boolean;
};

export function CheckboxComponent({ onClick, disabled = false, checked, indeterminate = false }: CheckboxProps) {
    return (
        <Checkbox className='custom-checkbox' defaultChecked={checked} onClick={onClick} disabled={disabled} indeterminate={indeterminate} />
    );
}
