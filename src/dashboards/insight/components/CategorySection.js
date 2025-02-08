import { Box, Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& + &': {
        marginTop: theme.spacing(2),
    },
}));

const CategorySection = ({ category }) => {
    const renderValue = (key, value) => {
        // Handle null/undefined values
        if (value === null || value === undefined) {
            return (
                <Typography variant="body2" color="text.secondary">
                    Not specified
                </Typography>
            );
        }

        // Handle arrays
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return (
                    <Typography variant="body2" color="text.secondary">
                        None listed
                    </Typography>
                );
            }
            return value.map((item, index) => (
                <Typography key={index} variant="body2">
                    • {item}
                </Typography>
            ));
        }

        // Handle nested objects
        if (typeof value === 'object') {
            return Object.entries(value).map(([nestedKey, nestedVal]) => (
                <Box key={nestedKey} sx={{ mt: 1, ml: 2 }}>
                    <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ textTransform: 'uppercase' }}
                    >
                        {nestedKey.replace(/_/g, ' ')}
                    </Typography>
                    {renderValue(nestedKey, nestedVal)}
                </Box>
            ));
        }

        // Handle primitive values (strings, numbers, etc.)
        return <Typography variant="body2">{value}</Typography>;
    };

    const renderContent = () => {
        return Object.entries(category)
            .filter(([key]) => key !== 'category') // Exclude the category title
            .map(([key, value]) => (
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
                {category.category}
            </Typography>
            {renderContent()}
        </StyledCard>
    );
};

export default CategorySection;
