import { Box, Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& + &': {
        marginTop: theme.spacing(2),
    },
}));

const CategorySection = ({ subcategory, categoryName }) => {
    const renderValue = (key, value) => {
        if (typeof value === 'object') {
            return Object.entries(value).map(([nestedKey, nestedVal]) => (
                <Box key={nestedKey} sx={{ mt: 1, ml: 2 }}>
                    {Array.isArray(nestedVal) ? (
                        nestedVal.map((item, index) => (
                            <Box key={index} sx={{ mt: 0.5, ml: 2 }}>
                                {Object.entries(item).map(
                                    ([itemKey, itemValue]) => (
                                        <Typography
                                            key={itemKey}
                                            variant="body2"
                                        >
                                            {`${itemKey}: ${itemValue}`}
                                        </Typography>
                                    )
                                )}
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2">{nestedVal}</Typography>
                    )}
                </Box>
            ));
        }
    };

    const renderContent = () => {
        return Object.entries(subcategory).map(([key, value]) => (
            <Box key={key} sx={{ mb: 2 }}>
                <Typography
                    variant="subtitle1"
                    color="primary.main"
                    sx={{
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        mb: 1,
                    }}
                >
                    {key.replace(/_/g, ' ')}
                </Typography>
                {renderValue(key, value)}
            </Box>
        ));
    };

    return (
        <StyledCard>
            <Typography
                variant="h6"
                gutterBottom
                sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                }}
            >
                {categoryName.replace(/_/g, ' ')}
            </Typography>
            {renderContent()}
        </StyledCard>
    );
};

export default CategorySection;
