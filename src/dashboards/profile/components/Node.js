import { useState, useContext, } from 'react';
import {
    Box,
    Typography,
    TextField,
    styled,
    InputAdornment,
} from '@mui/material';
import {  AnimatePresence } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import {
    StyledRootNode,
    StyledQuestionNode,
    StyledCategoryNode,
} from '../styledProfileComponents';
import { ProfileContext } from '../../../contexts/ProfileContext';

const StyledShadowWrapper = styled('div')(({ theme }) => ({
    filter: `drop-shadow(0px 0px 10px ${theme.palette.primary.main})`,
}));

const RootNode = ({ node, onClick }) => {
    return (
        <StyledShadowWrapper>
            <StyledRootNode
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
            >
                <Typography
                    variant="body2"
                    sx={{ textAlign: 'center', padding: '5px' }}
                >
                    Generating Your Personalized Questions
                </Typography>
            </StyledRootNode>
        </StyledShadowWrapper>
    );
};

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
            </StyledQuestionNode>
        </StyledShadowWrapper>
    );
};

const CategoryNode = ({ node, onClick }) => {
    return (
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
    );
};

const Node = ({
    node,
    onClick,
    depth = 0,
    index = 0,
    total = 1,
    expandedNodes,
    setExpandedNodes,
    activeNode,
}) => {
    const isExpanded = expandedNodes.includes(node);
    const [answer, setAnswer] = useState('');
    const { updateAnswer } = useContext(ProfileContext);

    const handleClick = () => {
        setExpandedNodes((prev) =>
            isExpanded ? prev.filter((n) => n !== node) : [...prev, node]
        );

        onClick(node);
    };

    const handleSaveAnswer = (e, node) => {
        console.log('node', node);
        updateAnswer(node.id, answer);
    };

    const isRoot =
        node.name === 'Root' || node.name === 'Personalized Questions';
    if (isRoot) node.name = 'Personalized Questions';

    let angle, x, y;
    const radius = 150 * (depth + 1);

    angle = (index / total) * 2 * Math.PI - Math.PI / 2;

    x = radius * Math.cos(angle);
    y = radius * Math.sin(angle);

    const isQuestion = 'answer' in node;

    return (
        <Box
            id="node-container"
            sx={{
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                left: depth === 0 ? '50%' : `calc(50% + ${x}px)`,
                top: depth === 0 ? '50%' : `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            {isRoot ? (
                <RootNode node={node} onClick={handleClick} />
            ) : isQuestion ? (
                <QuestionNode node={node} onClick={handleClick} />
            ) : (
                <CategoryNode node={node} onClick={handleClick} />
            )}

            {isExpanded && node.children && (
                <AnimatePresence>
                    {node.children.map((child, idx) => (
                        <Node
                            key={idx}
                            node={child}
                            onClick={onClick}
                            depth={depth + 1}
                            index={idx}
                            total={node.children.length}
                            expandedNodes={expandedNodes}
                            setExpandedNodes={setExpandedNodes}
                            activeNode={activeNode}
                        />
                    ))}
                    {isQuestion && node === activeNode && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                height: '300px',
                            }}
                        >
                            <Typography variant="body2">
                                {node.answer}
                            </Typography>
                            <TextField
                                fullWidth
                                autoFocus
                                variant="outlined"
                                value={answer}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <StyledIconButton
                                                disadfsabled={!answer}
                                                disableRipple
                                                aria-label="answer input field"
                                                onClick={() => {
                                                    handleSaveAnswer(
                                                        answer,
                                                        node
                                                    );
                                                    setAnswer('');
                                                }}
                                            >
                                                <SendIcon />
                                            </StyledIconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={(e) => setAnswer(e.target.value)}
                            />
                        </Box>
                    )}
                </AnimatePresence>
            )}
        </Box>
    );
};

export default Node;
