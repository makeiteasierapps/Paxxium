import { Box } from '@mui/material';
import {
    CategoryButtonContainer,
    CategoryText,
} from '../styledInsightComponents';

const CategoryButton = ({ name, onClick, activeCategory, categoryKey }) => {

    return (
        <Box>
            <CategoryButtonContainer
                selected={activeCategory === categoryKey}
                onClick={() => onClick(categoryKey)}
            >
                <CategoryText>{name}</CategoryText>
            </CategoryButtonContainer>
        </Box>
    );
};

export default CategoryButton;
