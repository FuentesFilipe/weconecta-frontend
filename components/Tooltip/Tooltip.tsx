import { Tooltip } from '@mui/material';
import React from 'react';
import './index.css';

export default function TooltipComponent({
    children,
    title,
    placement = 'top',
}: {
    children: React.ReactNode;
    title: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}) {
    return (
        <Tooltip title={<p className='custom-tooltip'>{title}</p>} placement={placement} arrow={true}>
            <span>{children}</span>
        </Tooltip>
    );
}
