import { useContext } from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon, Box } from '@mui/material';
import { KbContext } from '../../../contexts/KbContext';
import { PlaylistAdd } from '@mui/icons-material/';

export default function KbSpeedDial() {
    const {
        setIsNewKbOpen,
    } = useContext(KbContext);
    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 50,
                m: 1,
                zIndex: 1000,
            }}
        >
            <SpeedDial
                ariaLabel="Agent Speed Dial"
                icon={<SpeedDialIcon />}
                direction="right"
            >
                <SpeedDialAction
                    key={'Web Scrape'}
                    icon={<PlaylistAdd />}
                    tooltipTitle={'New Knowledge Base'}
                    onClick={() => setIsNewKbOpen(true)}
                />
            </SpeedDial>
        </Box>
    );
}
