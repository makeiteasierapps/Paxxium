import { Box } from '@mui/material';

const TabPanel = ({ children, value, index, ...other }) => {
    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </Box>
    );
};

export default TabPanel;
