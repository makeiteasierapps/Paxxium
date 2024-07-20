import { Box, CircularProgress, styled, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { ProfileContext } from '../../contexts/ProfileContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import MySnackbar from '../../SnackBar';
import GraphComponent from './components/KnowledgeGraph';
import { StyledButton, CustomTextField } from './styledProfileComponents';
const MainContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '90vh',
}));

const InputContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '9px',
    width: '70vw',
    height: '40vh',
    boxShadow: `0px 0px 6px 2px ${theme.palette.primary.main}`,
}));

const ProfileDash = () => {
    const [userInput, setUserInput] = useState('');
    const { generateBaseQuestions, isLoading } = useContext(ProfileContext);
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);

    const handleStartGeneratingQuestions = async () => {
        await generateBaseQuestions(userInput);
    };

    return (
        <MainContainer id="main-container">
            <InputContainer>
                <Typography variant="h6" gutterBottom>
                    Tell Paxx about yourself
                </Typography>
                <CustomTextField
                    multiline
                    rows={4}
                    fullWidth
                    autoFocus
                    variant="standard"
                    value={userInput}
                    onChange={(event) => {
                        setUserInput(event.target.value);
                    }}
                />
                <StyledButton
                    id="start-generating-questions"
                    onClick={handleStartGeneratingQuestions}
                    size="large"
                    sx={{ margin: 3 }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Get Started'}
                </StyledButton>
            </InputContainer>
            <MySnackbar
                open={snackbarInfo.open}
                message={snackbarInfo.message}
                severity={snackbarInfo.severity}
                handleClose={hideSnackbar}
            />
            <GraphComponent />
        </MainContainer>
    );
};

export default ProfileDash;
