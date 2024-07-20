import { useState, useContext, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    styled,
    InputAdornment,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
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
    const isExpanded = expandedNodes.includes(node) || !node.parent;
    const [answer, setAnswer] = useState('');
    const { updateAnswer } = useContext(ProfileContext);
    const [isMounted, setIsMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const nodeRef = useRef(null);

    useEffect(() => {
        if (isHovered && nodeRef.current) {
            nodeRef.current.style.zIndex = '9999';
        } else if (nodeRef.current) {
            nodeRef.current.style.zIndex = depth.toString();
        }
    }, [isHovered, depth]);

    // Reset the mount state when the node changes
    useEffect(() => {
        setIsMounted(false);
        const timer = setTimeout(() => setIsMounted(true), 10);
        return () => clearTimeout(timer);
    }, [node]);

    const handleClick = () => {
        console.log('Node clicked:', node);
        setExpandedNodes((prev) =>
            isExpanded ? prev.filter((n) => n !== node) : [...prev, node]
        );
        onClick(node);
    };

    const handleSaveAnswer = (e, node) => {
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

    const initialAnimationDelay = depth * 0.3 + index * 0.3;

    return (
        <Box
            ref={nodeRef}
            key={node.id}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                    opacity: isMounted ? 1 : 0,
                    scale: isMounted ? 1 : 0.5,
                }}
                transition={{
                    delay: initialAnimationDelay,
                    duration: 0.5,
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
                                key={`${node.id}-${idx}`}
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
                                                    disabled={!answer}
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
            </motion.div>
        </Box>
    );
};

export default Node;
