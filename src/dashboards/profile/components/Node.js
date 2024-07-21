import { useState, useContext, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    styled,
    InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AnimatePresence, motion } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import {
    StyledRootNode,
    StyledQuestionNode,
    StyledCategoryNode,
    InputContainer,
} from '../styledProfileComponents';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { SettingsContext } from '../../../contexts/SettingsContext';

const StyledShadowWrapper = styled('div')(({ theme }) => ({
    filter: `drop-shadow(0px 0px 10px ${theme.palette.primary.main})`,
}));

const RootNode = ({ node, onClick }) => {
    const { avatar } = useContext(SettingsContext);
    console.log('avatar', avatar);
    return (
        <StyledShadowWrapper>
            <StyledRootNode
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
                sx={{
                    backgroundImage: `url(${avatar})`,
                }}
            />
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

const QaNode = ({ node, onClick }) => {
    const [answer, setAnswer] = useState('');
    const { updateAnswer } = useContext(ProfileContext);

    const handleSaveAnswer = (e, node) => {
        updateAnswer(node.id, answer);
    };

    return (
        <InputContainer sx={{ height: '70%', width: '90vw' }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '300px',
                }}
            >
                <StyledIconButton
                    onClick={onClick}
                    sx={{ position: 'absolute', top: '10px', left: '10px' }}
                    aria-label="close"
                >
                    <CloseIcon />
                </StyledIconButton>
                <Typography
                    variant="h5"
                    sx={{
                        width: '60%',
                        textAlign: 'center',
                        paddingTop: '20px',
                        fontFamily: 'Roboto, sans-serif',
                    }}
                >
                    {node.name}
                </Typography>
                {node.answer && (
                    <Typography
                        variant="body1"
                        sx={{
                            textAlign: 'center',
                            marginTop: '10px',
                            fontFamily: 'Roboto, sans-serif',
                        }}
                    >
                        {node.answer}
                    </Typography>
                )}
                <TextField
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
                                        handleSaveAnswer(answer, node);
                                        setAnswer('');
                                    }}
                                >
                                    <SendIcon />
                                </StyledIconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '40px',
                        },
                        marginBottom: '20px',
                        width: '90%',
                    }}
                    onChange={(e) => setAnswer(e.target.value)}
                />
            </Box>
        </InputContainer>
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
        setExpandedNodes((prev) =>
            isExpanded ? prev.filter((n) => n !== node) : [...prev, node]
        );
        onClick(node);
    };

    const isRoot =
        node.name === 'Root' || node.name === 'Personalized Questions';
    if (isRoot) node.name = 'Personalized Questions';

    let angle, x, y;
    const radius = 150 * (depth + 1);
    angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    x = radius * Math.cos(angle);
    y = radius * Math.sin(angle);

    const isQuestion = 'answer' in node && node !== activeNode;
    const isQa = 'answer' in node;

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
                ) : isQa ? (
                    <QaNode node={node} onClick={handleClick} />
                ) : (
                    <CategoryNode node={node} onClick={handleClick} />
                )}

                {isExpanded && (
                    <AnimatePresence>
                        {node.children.length > 0
                            ? node.children.map((child, idx) => (
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
                              ))
                            : null}
                    </AnimatePresence>
                )}
            </motion.div>
        </Box>
    );
};

export default Node;
