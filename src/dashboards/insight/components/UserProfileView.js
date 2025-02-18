import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import CategorySection from './CategorySection';
import QuestionHub from './QuestionsHub';
const StyledBox = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
    },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
    },
}));

const UserProfileView = ({ userInsight }) => {
    // Check if userInsight is defined
    if (!userInsight) {
        return (
            <StyledBox>
                <Typography>No user insight data available</Typography>
            </StyledBox>
        );
    }

    return (
        <StyledBox>
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                width="50vw"
                height="50vh"
            >
                <QuestionHub questionsData={userInsight.questions_data} />
            </Box>

            {/* <ContentContainer>
                {userInsight.categories &&
                    Object.entries(userInsight.categories).map(
                        ([name, subcategory]) => (
                            <CategorySection
                                key={name}
                                categoryName={name}
                                subcategory={subcategory}
                            />
                        )
                    )}
            </ContentContainer> */}
        </StyledBox>
    );
};

export default UserProfileView;
