import { Box, Button, CircularProgress } from '@mui/material';
import { useContext, useState } from 'react';
import { ProfileContext } from './ProfileContext';
import { SnackbarContext } from '../../SnackbarContext';
import MySnackbar from '../../SnackBar';
import Questions from './components/Questions';
import User from './components/User';

import { MainContainer } from './styledProfileComponents';

const ProfileDash = () => {
    const {
        analyzeProfile,
        profileData,
        answers,
        updateUserProfile,
        updateAnswers,
    } = useContext(ProfileContext);
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);

    // State to manage analysis loading indicator
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const handleUpdate = async (profileData = null, answers = null) => {
        setIsUpdating(true);
        await updateUserProfile(profileData);
        await updateAnswers(answers);
        setIsUpdating(false);
    };

    const handleAnalyzeProfile = async () => {
        setIsAnalyzing(true); // Start loading
        await analyzeProfile();
        setIsAnalyzing(false); // End loading
    };

    return (
        <MainContainer id="main-container">
            <User />

            <Questions />
            <Button
                id="update-profile-button"
                variant="contained"
                onClick={() => handleUpdate(profileData, answers)}
                sx={{ margin: 3 }}
                disabled={isUpdating}
            >
                {isUpdating ? <CircularProgress size={24} /> : 'Save'}
            </Button>
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
                <Button
                    variant="contained"
                    onClick={handleAnalyzeProfile}
                    sx={{ margin: 3 }}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? <CircularProgress size={24} /> : 'Analyze'}
                </Button>
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
