import { useContext } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import MySnackbar from '../../SnackBar';
import User from './User';

import { MainContainer } from '../profile/styledProfileComponents';

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
