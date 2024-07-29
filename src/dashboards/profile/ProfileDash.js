import { useContext } from 'react';
import { CircularProgress } from '@mui/material';
import GraphComponent from './components/GraphComponent';
import { MainContainer } from '../styledComponents/DashStyledComponents';
import GenerateQuestionsForm from './components/GenerateQuestionsForm';
import { ProfileContext } from '../../contexts/ProfileContext';

const ProfileDash = () => {
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
        </MainContainer>
    );
};

export default ProfileDash;
