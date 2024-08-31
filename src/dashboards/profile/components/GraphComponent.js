import { useContext } from 'react';
import { Box } from '@mui/material';
import Node from './Node';
import { ProfileContext } from '../../../contexts/ProfileContext';

const GraphComponent = () => {
    const {
        treeData,
        activeNodeId,
        setActiveNodeId,
        expandedNodes,
        setExpandedNodes,
    } = useContext(ProfileContext);
    const findNodeById = (tree, id) => {
        if (tree.id === id) return tree;
        if (tree.children) {
            for (const child of tree.children) {
                const result = findNodeById(child, id);
                if (result) return result;
            }
        }
        return null;
    };

    const findParentNode = (tree, targetId) => {
        if (tree.children) {
            for (const child of tree.children) {
                if (child.id === targetId) {
                    return tree;
                }
                const result = findParentNode(child, targetId);
                if (result) return result;
            }
        }
        return null;
    };

    const handleNodeClick = (nodeId) => {
        setActiveNodeId((prevActiveNodeId) => {
            if (nodeId === prevActiveNodeId) {
                const parentNode = findParentNode(treeData, nodeId);
                return parentNode ? parentNode.id : treeData.id;
            }
            return nodeId;
        });

        setExpandedNodes((prev) => {
            if (prev.includes(nodeId)) {
                return prev.filter((id) => id !== nodeId);
            } else {
                return [...prev, nodeId];
            }
        });
    };

    const activeNode = findNodeById(treeData, activeNodeId);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '80%',
                minHeight: '90vh',
                height: '87%',
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
