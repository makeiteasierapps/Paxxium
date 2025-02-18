import { useState } from 'react';
import { Box } from '@mui/material';
import { ScrollContainer, ScrollContent } from '../styledInsightComponents';
import CategoryButton from './CategoryButton';
import QACard from './QACard';

const QuestionHub = ({ questionsData }) => {
    const [activeCategory, setActiveCategory] = useState(
        questionsData ? Object.keys(questionsData)[0] : null
    );

    // If no data, return early
    if (!questionsData) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                }}
            >
                No questions available
            </Box>
        );
    }

    // Transform data for category buttons
    const categories = Object.keys(questionsData || {}).map((categoryKey) => ({
        name: categoryKey.replace(/_/g, ' '),
        key: categoryKey,
        subCategories: questionsData[categoryKey],
    }));

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
            }}
        >
            <ScrollContainer>
                <ScrollContent>
                    {categories.map((category) => (
                        <CategoryButton
                            key={category.key}
                            name={category.name}
                            activeCategory={activeCategory}
                            categoryKey={category.key}
                            onClick={() => {
                                setActiveCategory(category.key);
                            }}
                        />
                    ))}
                </ScrollContent>
            </ScrollContainer>

            {activeCategory && (
                <QACard
                    questionsData={questionsData[activeCategory]}
                    category={activeCategory}
                />
            )}
        </Box>
    );
};

export default QuestionHub;
