import React, { useState } from 'react';
import { SnackbarProvider } from '../contexts/SnackbarContext';
import MySnackBar from '../SnackBar';

const SnackbarWrapper = ({ children }) => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    const snackbarValue = {
        showSnackbar,
        handleCloseSnackbar,
        ...snackbar
    };

    return (
        <SnackbarProvider value={snackbarValue}>
            {children}
            <MySnackBar
                open={snackbar.open}
                handleClose={handleCloseSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </SnackbarProvider>
    );
};

export default SnackbarWrapper;