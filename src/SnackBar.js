import { Snackbar, Alert, Box } from '@mui/material';

const MySnackBar = ({ open, handleClose, message, severity }) => {
    return (
        <Box>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MySnackBar;
