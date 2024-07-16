import { Box, CircularProgress } from '@mui/material';
import { useContext, useState } from 'react';
import { ProfileContext } from '../../contexts/ProfileContext';
import { SettingsContext } from '../../contexts/SettingsContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import MySnackbar from '../../SnackBar';
import Questions from './components/Questions';


import { MainContainer, StyledButton } from './styledProfileComponents';

const ProfileDash = () => {
    const {
        answers,
        updateAnswers,
        analyzeAnsweredQuestions,
    } = useContext(ProfileContext);
    const { profileData } = useContext(SettingsContext);
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);

    // State to manage analysis loading indicator
    const [isLoading, setIsLoading] = useState(false);
    
    const handleUpdate = async (answers = null) => {
        setIsLoading(true);
        await updateAnswers(answers);
        setIsLoading(false);
    };

    const handleAnalyzeProfile = async () => {
        setIsLoading(true); 
        await analyzeAnsweredQuestions();
        setIsLoading(false);
    };

    return (
        <MainContainer id="main-container">
            <Questions />
            <StyledButton
                id="update-profile-button"
                onClick={() => handleUpdate(answers)}
                size="large"
                sx={{ margin: 3 }}
                disabled={isLoading}
            >
                {isLoading ? <CircularProgress size={24} /> : 'Save'}
            </StyledButton>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                <Box
                    sx={{
                        padding: 2,
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                    }}
                >
                    {profileData.analysis
                        ? profileData.analysis
                        : 'Analyze Profile'}
                </Box>
                <StyledButton
                    onClick={handleAnalyzeProfile}
                    size="large"
                    disabled={isLoading}
                    sx={{ margin: 3 }}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Analyze'}
                </StyledButton>
            </Box>

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
