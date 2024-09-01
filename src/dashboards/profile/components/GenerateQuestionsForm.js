import { useState, useContext } from 'react';
import {
    Typography,
    CircularProgress,
} from '@mui/material';
import { ProfileContext } from '../../../contexts/ProfileContext';
import {
    StyledButton,
    CustomTextField,
} from '../styledProfileComponents';
import { StyledContainer } from '../../styledComponents/DashStyledComponents';
const GenerateQuestionsForm = () => {
    const [userInput, setUserInput] = useState('');
    const { generateBaseQuestions, isLoading } = useContext(ProfileContext);
    const handleStartGeneratingQuestions = async () => {
        await generateBaseQuestions(userInput);
    };
    return (
        <StyledContainer>
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
        </StyledContainer>
    );
};

export default GenerateQuestionsForm;
