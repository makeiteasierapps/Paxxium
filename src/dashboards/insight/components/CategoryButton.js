import { useContext } from 'react';
import { Box } from '@mui/material';
import {
    CategoryButtonContainer,
    StyledProgressIndicator,
    ProgressBar,
    ProgressText,
    CategoryText,
} from '../styledInsightComponents';
import { InsightContext } from '../../../contexts/InsightContext';

const CategoryNode = ({ category, onClick }) => {
    const { activeCategory } = useContext(InsightContext);
    const totalQuestions = category.questions ? category.questions.length : 0;
    const answeredQuestions = category.questions
        ? category.questions.filter((question) => question.answer).length
        : 0;

    return (
        <Box>
            <CategoryButtonContainer
                progress={answeredQuestions / totalQuestions}
                selected={activeCategory === category}
                onClick={() => onClick(category)}
            >
                <CategoryText>{category.category}</CategoryText>

                <StyledProgressIndicator>
                    <ProgressBar
                        width={`${(answeredQuestions / totalQuestions) * 100}%`}
                    />
                    <ProgressText variant="caption">
                        {`${answeredQuestions}/${totalQuestions}`}
                    </ProgressText>
                </StyledProgressIndicator>
            </CategoryButtonContainer>
        </Box>
    );
};

export default CategoryNode;
