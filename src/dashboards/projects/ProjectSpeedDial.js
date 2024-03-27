import { SpeedDial, SpeedDialAction, SpeedDialIcon, Box } from '@mui/material';
import { WebAsset, FileCopy, PlaylistAdd } from '@mui/icons-material/';

export default function ProjectSpeedDial({
    isWebScrapeOpen,
    setIsWebScrapeOpen,
    setIsExtractFileOpen,
    isExtractFileOpen,
    setIsNewProjectOpen,
    isNewProjectOpen,
}) {
    const actions = [
        {
            icon: <WebAsset />,
            name: 'Scrape Web',
            setState: setIsWebScrapeOpen,
            state: isWebScrapeOpen,
        },
        {
            icon: <FileCopy />,
            name: 'Extract Document',
            setState: setIsExtractFileOpen,
            state: isExtractFileOpen,
        },
        {
            icon: <PlaylistAdd />,
            name: 'New Project',
            setState: setIsNewProjectOpen,
            state: isNewProjectOpen,
        },
    ];

    return (
        <Box sx={{ height: 320, flexGrow: 1 }}>
            <SpeedDial ariaLabel="Agent Speed Dial" icon={<SpeedDialIcon />} direction='rightf'>
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
