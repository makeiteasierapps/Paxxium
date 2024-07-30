import { useState, useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import Node from './Node';
import { ProfileContext } from '../../../contexts/ProfileContext';

const GraphComponent = () => {
    const { treeData, analyzeAnsweredQuestions } = useContext(ProfileContext);
    const [activeNode, setActiveNode] = useState(treeData);
    const [expandedNodes, setExpandedNodes] = useState([treeData]);

    useEffect(() => {
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
