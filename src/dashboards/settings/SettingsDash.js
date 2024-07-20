import { useContext } from 'react';
import { Box, styled } from '@mui/material';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import MySnackbar from '../../SnackBar';
import User from './User';

const MainContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
    gap: theme.spacing(10),
    margin: 'auto',
    maxWidth: '1200px',
    boxShadow: `0px 0px 6px 2px ${theme.palette.primary.main}`,
}));

const SettingsDash = () => {
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);

    return (
        <MainContainer id="main-container">
            <User />
            <MySnackbar
                open={snackbarInfo.open}
                message={snackbarInfo.message}
                severity={snackbarInfo.severity}
                handleClose={hideSnackbar}
            />
        </MainContainer>
    );
};

export default SettingsDash;
