import SaveIcon from '@mui/icons-material/Save';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { AlignCenterVertical, Plus } from 'lucide-react';
import * as React from 'react';
import './index.css';

export enum CanvasActions {
  NEW_MESSAGE = 'newMessage',
  ORGANIZE = 'organize',
  SAVE = 'save',
}

const actions = {
  [CanvasActions.NEW_MESSAGE]: { icon: <Plus />, name: 'Nova Mensagem' },
  [CanvasActions.ORGANIZE]: { icon: <SaveIcon />, name: 'Salvar' },
  [CanvasActions.SAVE]: { icon: <AlignCenterVertical />, name: 'Organizar' },
}

export default function SpeedDialTooltipOpen({ canvasActions }: {
  canvasActions: { [CanvasActions.NEW_MESSAGE]: () => void;[CanvasActions.ORGANIZE]: () => void;[CanvasActions.SAVE]: () => void }
}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
            onClick={() => {
              canvasActions[CanvasActions[key]]()
              handleClose();
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
