import { SpeedDial, SpeedDialAction, SpeedDialIcon, Box } from '@mui/material';
import { WebAsset, FileCopy, PlaylistAdd } from '@mui/icons-material/';

export default function ProjectSpeedDial({
    setIsNewProjectOpen,
    isNewProjectOpen,
}) {
    const actions = [
        {
            icon: <PlaylistAdd />,
            name: 'New Project',
            setState: setIsNewProjectOpen,
            state: isNewProjectOpen,
        },
    ];

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 50,
                m: 1, // Adds a little margin around the box for visual spacing
                zIndex: 1000,
            }}
        >
            <SpeedDial
                ariaLabel="Agent Speed Dial"
                icon={<SpeedDialIcon />}
                direction="right"
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={() => action.setState(!action.state)}
                    />
                ))}
            </SpeedDial>
        </Box>
    );
}
