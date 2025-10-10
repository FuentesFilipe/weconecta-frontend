import SaveIcon from '@mui/icons-material/Save';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { AlignCenterVertical, Plus } from 'lucide-react';
import * as React from 'react';
import './speeddial.css';

const actions = [
  { icon: <Plus />, name: 'Nova Mensagem' },
  { icon: <SaveIcon />, name: 'Salvar' },
  { icon: <AlignCenterVertical />, name: 'Organizar' }
];

export default function SpeedDialTooltipOpen() {
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
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            slotProps={{
              tooltip: {
                open: true,
                title: action.name,
              },
            }}
            onClick={handleClose}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
