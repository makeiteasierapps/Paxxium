import {
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
} from '@mui/material';

const HelpDialog = ({ isHelpOpen, handleHelpClose }) => (
    <Dialog open={isHelpOpen} onClose={handleHelpClose} maxWidth="sm" fullWidth>
        <DialogTitle>How This Works</DialogTitle>
        <DialogContent>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Typography variant="body1">
                1. <strong>Introduction:</strong> Share some basic information
                about yourself
            </Typography>
            <Typography variant="body1">
                2. <strong>Answer Questions:</strong> Respond to personalized
                questions about your background, goals, and experiences
            </Typography>
            <Typography variant="body1">
                3. <strong>Get Insights:</strong> Receive tailored suggestions
                and guidance for your personal development
            </Typography>
        </Box>
    </DialogContent>
    <DialogActions>
        <Button onClick={handleHelpClose} color="primary">
            Close
        </Button>
        </DialogActions>
    </Dialog>
);

export default HelpDialog;
