import SaveIcon from '@mui/icons-material/Save';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { AlignCenterVertical, Plus } from 'lucide-react';
import * as React from 'react';
import './index.css';

export const CanvaActionsType = {
    NEW_MESSAGE: 'NEW_MESSAGE',
    SAVE_CANVA: 'SAVE_CANVA',
    ORGANIZE_CANVA: 'ORGANIZE_CANVA',
}

const actions = {
    [CanvaActionsType.NEW_MESSAGE]: { icon: <Plus />, name: 'Nova Mensagem' },
    [CanvaActionsType.SAVE_CANVA]: { icon: <SaveIcon />, name: 'Salvar' },
    [CanvaActionsType.ORGANIZE_CANVA]: { icon: <AlignCenterVertical />, name: 'Organizar' }
}

export default function SpeedDialTooltipOpen({ canvaActions }: { canvaActions: { [key: string]: () => void } }) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const onClick = (key: string) => {
        canvaActions[key]();
        handleClose();
    }

    return (
        <Box style={{
            zIndex: 1000,
        }}>
            <Backdrop open={open} />
            <SpeedDial
                ariaLabel="SpeedDial tooltip example"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
                className="custom-speed-dial"

            >
                {Object.entries(actions).map(([key, action]) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        slotProps={{
                            tooltip: {
                                open: true,
                                title: action.name,
                            },
                        }}
                        onClick={() => onClick(key)}
                    />
                ))}
            </SpeedDial>
        </Box>
    );
}
