import { useState } from 'react';
import { Box } from '@mui/material';
import { ScrollContainer, ScrollContent } from '../styledInsightComponents';
import CategoryButton from './CategoryButton';
import QACard from './QACard';

const QuestionHub = ({ questionsData }) => {
    const [activeCategory, setActiveCategory] = useState(
        Object.keys(questionsData)[0]
    );

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
                <QACard questionsData={questionsData[activeCategory]} />
            )}
        </Box>
    );
};

export default QuestionHub;
