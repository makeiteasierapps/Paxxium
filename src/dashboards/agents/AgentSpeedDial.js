import { SpeedDial, SpeedDialAction, SpeedDialIcon, Box } from '@mui/material';
import { WebAsset } from '@mui/icons-material/';

const actions = [{ icon: <WebAsset />, name: 'Scrape' }];

export default function AgentSpeedDial({ setIsScrapeOpen }) {
    return (
        <Box sx={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1 }}>
            <SpeedDial ariaLabel="Agent Speed Dial" icon={<SpeedDialIcon />}>
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={() => setIsScrapeOpen(true)}
                    />
                ))}
            </SpeedDial>
        </Box>
    );
}
