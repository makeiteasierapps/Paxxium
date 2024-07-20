import { useContext, useState } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import MySnackbar from '../../SnackBar';
import GraphComponent from './components/GraphComponent';
import { MainContainer } from '../styledComponents/DashStyledComponents';
import GenerateQuestionsForm from './components/GenerateQuestionsForm';

const ProfileDash = () => {
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);
    const [isQuestionsFormOpen, setIsQuestionsFormOpen] = useState(false);
    return (
        <MainContainer id="main-container">
            {isQuestionsFormOpen && <GenerateQuestionsForm />}
            <GraphComponent />
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
