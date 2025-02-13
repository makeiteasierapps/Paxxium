import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import TabPanel from './TabPanel';
import CategorySection from './CategorySection';

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

const TabsContainer = styled(Box)({
    position: 'sticky',
    top: 0,
    zIndex: 1,
});

const ContentContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
    },
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: 600,
}));

const UserProfileView = ({ userInsight }) => {
    const [value, setValue] = useState(0);

    // Check if userInsight is defined
    if (!userInsight) {
        return (
            <StyledBox>
                <Typography>No user insight data available</Typography>
            </StyledBox>
        );
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const getTitleForTab = (index) => {
        return index === 0
            ? 'Foundational Information'
            : 'Objective Information';
    };

    return (
        <StyledBox>
            <TabsContainer>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Foundational" />
                    <Tab label="Objective" />
                </Tabs>
            </TabsContainer>

            <ContentContainer>
                <TabPanel value={value} index={0}>
                    <CategoryTitle variant="h5">
                        {getTitleForTab(0)}
                    </CategoryTitle>
                    {userInsight.foundational && 
                        Object.entries(userInsight.foundational).map(([categoryType, category]) => (
                            <CategorySection 
                                key={categoryType}
                                categoryType={categoryType}
                                category={category}
                            />
                        ))}
                </TabPanel>

                <TabPanel value={value} index={1}>
                    <CategoryTitle variant="h5">
                        {getTitleForTab(1)}
                    </CategoryTitle>
                    {userInsight.objective &&
                        Object.entries(userInsight.objective).map(
                            ([categoryType, category]) => (
                                <CategorySection
                                    key={categoryType}
                                    categoryType={categoryType}
                                    category={category}
                                />
                            )
                        )}
                </TabPanel>
            </ContentContainer>
        </StyledBox>
    );
};

export default UserProfileView;
