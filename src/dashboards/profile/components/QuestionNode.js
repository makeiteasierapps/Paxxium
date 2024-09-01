import { Typography } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {
    StyledQuestionNode,
    StyledShadowWrapper,
} from '../styledProfileComponents';

const QuestionNode = ({ node, onClick }) => {
    return (
        <StyledShadowWrapper>
            <StyledQuestionNode
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
                {node.answer && (
                    <TaskAltIcon
                        sx={{
                            fontSize: '1.3rem',
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            padding: '4px',
                            borderRadius: '50%',
                        }}
                    />
                )}
            </StyledQuestionNode>
        </StyledShadowWrapper>
    );
};

export default QuestionNode;
