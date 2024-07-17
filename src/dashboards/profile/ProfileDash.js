import {
    Box,
    CircularProgress,
    styled,
    TextField,
    Typography,
} from '@mui/material';

import { useContext, useState } from 'react';
import { ProfileContext } from '../../contexts/ProfileContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import MySnackbar from '../../SnackBar';

import { StyledButton } from './styledProfileComponents';
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

const CustomTextField = styled(TextField)(({ theme }) => ({
    width: '80%',
    textAlign: 'center',
    '& .MuiInputBase-input': {
        textAlign: 'center',
    },
    '& .MuiInputBase-root': {
        border: 'none',
    },
    '& .MuiInput-underline:before': {
        borderBottom: 'none',
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
        borderBottom: 'none',
    },
    '& .MuiInput-underline:after': {
        borderBottom: 'none',
    },
}));

const ProfileDash = () => {
    const [userInput, setUserInput] = useState('');
    const { generateFollowUpQuestions, isLoading } = useContext(ProfileContext);
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);
    

    const handleStartGeneratingQuestions = async () => {
        await generateFollowUpQuestions(userInput);
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
        </MainContainer>
    );
};

export default ProfileDash;
