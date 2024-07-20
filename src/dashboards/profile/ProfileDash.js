import { useContext } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { CircularProgress } from '@mui/material';
import MySnackbar from '../../SnackBar';
import GraphComponent from './components/GraphComponent';
import { MainContainer } from '../styledComponents/DashStyledComponents';
import GenerateQuestionsForm from './components/GenerateQuestionsForm';
import { ProfileContext } from '../../contexts/ProfileContext';

const ProfileDash = () => {
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);
    const { isQuestionsFormOpen, isGraphOpen, isLoading } =
        useContext(ProfileContext);

    return (
        <MainContainer id="main-container">
            {isLoading ? (
                <CircularProgress />
            ) : (
                <>
                    {isQuestionsFormOpen && <GenerateQuestionsForm />}
                    {isGraphOpen && <GraphComponent />}
                </>
            )}
            <MySnackbar
                open={snackbarInfo.open}
                message={snackbarInfo.message}
                severity={snackbarInfo.severity}
                handleClose={hideSnackbar}
            />
        </MainContainer>
    );
};

export default ProfileDash;
