import { Box, Tab, TextField } from '@mui/material';
import React, { useContext, useState } from 'react';
import { ProfileContext, questions } from '../../../contexts/ProfileContext';

import {
    StyledTabs,
    QuestionsContainer,
    Question,
} from '../styledProfileComponents';

const Questions = () => {
    const { answers, handleAnswerChange } = useContext(ProfileContext);
    const [currentTab, setCurrentTab] = useState(0);

    return (
        <QuestionsContainer id="questions-container">
            <StyledTabs
                id="question-category-tabs"
                value={currentTab}
                onChange={(_, newValue) => setCurrentTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                {Object.keys(questions).map((category, index) => (
                    <Tab disableRipple key={index} label={category} />
                ))}
            </StyledTabs>
            {Object.entries(questions).map(
                ([category, categoryQuestions], index) => (
                    <Box hidden={currentTab !== index} key={index}>
                        {categoryQuestions.map((question, questionIndex) => (
                            <Box key={questionIndex}>
                                <Question variant="body1">{`${question}`}</Question>
                                <TextField
                                    fullWidth
                                    label="Answer"
                                    variant="outlined"
                                    value={answers[category]?.[question] ?? ''}
                                    onChange={(e) =>
                                        handleAnswerChange(
                                            category,
                                            question,
                                            e.target.value
                                        )
                                    }
                                />
                            </Box>
                        ))}
                    </Box>
                )
            )}
        </QuestionsContainer>
    );
};

export default Questions;
