import { Box, Button } from '@mui/material';
import { useContext } from 'react';
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

    const handleUpdate = async (profileData = null, answers = null) => {
        await updateUserProfile(profileData);
        await updateAnswers(answers);
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
            >
                Save
            </Button>
            <Box
                sx={{
                    margin: 3,
                    padding: 2,
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                }}
            >
                {profileData.analysis ? profileData.analysis : 'Analyze Profile'}
            </Box>
            <Button
                variant="contained"
                onClick={analyzeProfile}
                sx={{ margin: 3 }}
            >
                Analyze
            </Button>
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
