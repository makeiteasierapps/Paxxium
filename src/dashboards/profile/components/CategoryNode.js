import { Typography, Box } from '@mui/material';
import {
    StyledCategoryNode,
    StyledShadowWrapper,
} from '../styledProfileComponents';

const CategoryNode = ({ node, onClick }) => {
    const totalQuestions = node.children ? node.children.length : 0;
    const answeredQuestions = node.children ? node.children.filter(child => child.answer).length : 0;

    return (
        <Box position="relative">
            <Typography
                variant="caption"
                sx={{
                    position: 'absolute',
                    top: -5,
                    right: 20,
                    zIndex: 1,
                    color: 'white',
                    padding: '2px 5px',
                    borderRadius: '4px',
                }}
            >
                {`${answeredQuestions}/${totalQuestions}`}
            </Typography>
            <StyledShadowWrapper>
                <StyledCategoryNode
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClick}
                >
                    <Typography
                        variant="body2"
                        sx={{ textAlign: 'center', padding: '5px' }}
                    >
                        {node.name}
                    </Typography>
                </StyledCategoryNode>
            </StyledShadowWrapper>
        </Box>
    );
};

export default CategoryNode;
