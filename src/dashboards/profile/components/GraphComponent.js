import { useContext } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import CategoryNode from './CategoryNode';
import QaNode from './QaNode';
import { ProfileContext } from '../../../contexts/ProfileContext';

const ScrollContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '70%',
    margin: '0 auto',

    '&::after': {
        content: '""',
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100%',
        width: '40px',
        background: `linear-gradient(to left, ${theme.palette.background.default}, ${theme.palette.background.default}00)`,
        pointerEvents: 'none',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '40px',
        background: `linear-gradient(to right, ${theme.palette.background.default}, ${theme.palette.background.default}00)`,
        pointerEvents: 'none',
        zIndex: 1,
    },
}));

const ScrollContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
    gap: '1.5rem',
    overflowX: 'auto',
    padding: '0.5rem',
    scrollBehavior: 'smooth',
    scrollPadding: '0 24px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
        display: 'none',
    },
    paddingBottom: '1rem',
    paddingLeft: '24px',
    paddingRight: '24px',
}));

const GraphComponent = () => {
    const { questionsData, setActiveCategory, activeCategory } =
        useContext(ProfileContext);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                minHeight: '90vh',
                padding: '2rem',
                gap: '2rem',
            }}
        >
            <ScrollContainer>
                <ScrollContent>
                    {questionsData &&
                        questionsData.length > 0 &&
                        questionsData.map((category) => (
                            <CategoryNode
                                key={category.id}
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
                        padding: '1rem',
                    }}
                >
                    {activeCategory.questions?.map((question) => (
                        <QaNode key={question.id} questionData={question} />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default GraphComponent;
