import { Checkbox } from '../ui';
import './index.css';

export type CheckboxProps = {
    checked: boolean;
    onClick?: VoidFunction;
    disabled?: boolean;
};

export function CheckboxComponent({ onClick, disabled = false, checked }: CheckboxProps) {
    return (
        <Checkbox className="custom-checkbox w-5 h-5" defaultChecked={checked} onClick={onClick} disabled={disabled} />
    );
}
