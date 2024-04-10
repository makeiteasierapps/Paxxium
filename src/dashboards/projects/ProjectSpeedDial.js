import { useContext } from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon, Box } from '@mui/material';
import { ProjectContext } from './ProjectContext';
import { PlaylistAdd } from '@mui/icons-material/';

export default function ProjectSpeedDial() {
    const { setIsNewProjectOpen } = useContext(ProjectContext);
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
                    tooltipTitle={'New Project'}
                    onClick={() => setIsNewProjectOpen(true)}
                />
            </SpeedDial>
        </Box>
    );
}
