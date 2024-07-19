import { useState, useContext } from 'react';
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
    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
}));

const StyledShadowWrapper = styled('div')(({ theme }) => ({
    filter: `drop-shadow(0px 0px 10px dodgerblue)`,
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

const QuestionNode = ({ node, onClick, isQuestion }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            style={{
                borderRadius: isQuestion ? '10px' : '50%',
                background: '#3f51b5',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isQuestion ? 250 : 100,
                height: isQuestion ? 100 : 100,
                cursor: 'pointer',
                margin: 20,
                position: 'relative',
                padding: isQuestion ? '10px' : '0',
                textAlign: isQuestion ? 'center' : 'left',
            }}
        >
            <Typography
                variant="body2"
                sx={{ textAlign: 'center', padding: '5px' }}
            >
                {node.name}
            </Typography>
        </motion.div>
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
    const { updateAnswers } = useContext(ProfileContext);

    const handleClick = () => {
        if (isExpanded) {
            setExpandedNodes(expandedNodes.filter((n) => n !== node));
        } else {
            setExpandedNodes([...expandedNodes, node]);
        }
        onClick(node);
    };

    const handleAnswerChange = (e, node) => {
        node.answer = e.target.value;
        updateAnswers(node);
    };

    const isRoot =
        node.name === 'Root' || node.name === 'Personalized Questions';
    if (isRoot) node.name = 'Personalized Questions';

    let angle, x, y;
    const radius = 150 * (depth + 1);

    angle = (index / total) * 2 * Math.PI - Math.PI / 2;

    x = radius * Math.cos(angle);
    y = radius * Math.sin(angle);

    const isQuestion = !node.children || node.children.length === 0;

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
            ) : (
                <QuestionNode
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
                                value={node.answer}
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

    const handleNodeClick = (node) => {
        if (node === activeNode && node.parent) {
            setActiveNode(node.parent);
        } else {
            setActiveNode(node);
        }
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
                border: '1px solid red',
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
