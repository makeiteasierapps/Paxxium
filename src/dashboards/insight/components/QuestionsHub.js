import { useContext } from 'react';
import { Box } from '@mui/material';
import { ScrollContainer, ScrollContent } from '../styledInsightComponents';
import CategoryNode from './CategoryButton';
import QACard from './QACard';
import { InsightContext } from '../../../contexts/InsightContext';

const QuestionHub = () => {
    const { questionsData, setActiveCategory, activeCategory } =
        useContext(InsightContext);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                minHeight: '90vh',
                gap: '2rem',
            }}
        >
            <ScrollContainer>
                <ScrollContent>
                    {questionsData &&
                        questionsData.length > 0 &&
                        questionsData.map((category) => (
                            <CategoryNode
                                key={category._id}
                                category={category}
                                onClick={() => setActiveCategory(category)}
                            />
                        ))}
                </ScrollContent>
            </ScrollContainer>
            {activeCategory && (
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        justifyContent: 'center',
                        overflow: 'auto',
                        maxHeight: '80vh',
                    }}
                >
                    {activeCategory.questions?.map((question) => (
                        <QACard key={question._id} questionData={question} />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default QuestionHub;
