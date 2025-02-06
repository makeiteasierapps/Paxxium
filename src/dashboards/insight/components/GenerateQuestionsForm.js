import { useState, useContext } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import { InsightContext } from '../../../contexts/InsightContext';
import {
    StyledButton,
    ProfileTextField,
} from '../../userAccount/styledUserAccountComponents';
import { StyledContainer } from '../../styledComponents/DashStyledComponents';
const GenerateQuestionsForm = () => {
    const [userInput, setUserInput] = useState('');
    const { generateBaseQuestions, isLoading } = useContext(InsightContext);
    const handleStartGeneratingQuestions = async () => {
        await generateBaseQuestions(userInput);
    };
    return (
        <StyledContainer>
            <Typography variant="h6" gutterBottom>
                Tell Paxx about yourself
            </Typography>
            <ProfileTextField
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
