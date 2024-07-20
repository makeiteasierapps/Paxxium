import { useState, useContext, useEffect } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomTextField } from '../styledProfileComponents';
import { ProfileContext } from '../../../contexts/ProfileContext';

const StyledRootNode = styled(motion.div)(({ theme }) => ({
    borderRadius: '0',
    background: 'black',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    cursor: 'pointer',
    margin: 20,
    position: 'relative',
    padding: '10px',
    textAlign: 'center',
    clipPath:
        'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
}));

const StyledCategoryNode = styled(motion.div)(({ theme }) => ({
    background: 'black',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    height: 110,
    cursor: 'pointer',
    margin: 20,
    position: 'relative',
    padding: '10px',
    textAlign: 'center',
    clipPath:
        'polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 17% 12%)',
}));

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

const CategoryNode = ({ node, onClick, isQuestion, width, height }) => {
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

const QuestionNode = ({ node, onClick, isQuestion }) => {
    return (
        <CategoryNode
            node={node}
            onClick={onClick}
            isQuestion={isQuestion}
            width={isQuestion ? 250 : 100}
            height={100}
            borderRadius={isQuestion ? '10px' : '50%'}
        />
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
        updateAnswer(node._id, answer);
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
                <QuestionNode
                    node={node}
                    onClick={handleClick}
                    isQuestion={isQuestion}
                />
            ) : (
                <CategoryNode
                    node={node}
                    onClick={handleClick}
                    isQuestion={isQuestion}
                />
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
                            }}
                        >
                            <Typography variant="body2">
                                {node.answer}
                            </Typography>
                            <CustomTextField
                                multiline
                                rows={4}
                                fullWidth
                                autoFocus
                                variant="standard"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                            />
                        </Box>
                    )}
                </AnimatePresence>
            )}
        </Box>
    );
};

const GraphComponent = () => {
    const { treeData } = useContext(ProfileContext);
    const [activeNode, setActiveNode] = useState(treeData);
    const [expandedNodes, setExpandedNodes] = useState([treeData]);

    useEffect(() => {
        console.log('treeData', treeData);
        setActiveNode(treeData);
        setExpandedNodes([treeData]);
    }, [treeData]);

    const handleNodeClick = (node) => {
        setActiveNode((prevActiveNode) =>
            node === prevActiveNode && node.parent ? node.parent : node
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <Node
                    node={activeNode}
                    onClick={handleNodeClick}
                    expandedNodes={expandedNodes}
                    setExpandedNodes={setExpandedNodes}
                    activeNode={activeNode}
                />
            </Box>
        </Box>
    );
};

export default GraphComponent;
