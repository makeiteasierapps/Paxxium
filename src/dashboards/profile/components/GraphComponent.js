import { useContext } from 'react';
import { Box } from '@mui/material';
import Node from './Node';
import { ProfileContext } from '../../../contexts/ProfileContext';

const GraphComponent = () => {
    const { treeData, activeNodeId, setActiveNodeId } =
        useContext(ProfileContext);

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
    };
    const handleNavigate = (direction) => {
        const parentNode = findParentNode(treeData, activeNodeId);
        if (parentNode && parentNode.children) {
            const currentIndex = parentNode.children.findIndex(child => child.id === activeNodeId);
            let newIndex;
            if (direction === 'next') {
                newIndex = (currentIndex + 1) % parentNode.children.length;
            } else {
                newIndex = (currentIndex - 1 + parentNode.children.length) % parentNode.children.length;
            }
            setActiveNodeId(parentNode.children[newIndex].id);
        }
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
            <Node node={activeNode} onClick={handleNodeClick} isActive={true} onNavigate={handleNavigate} />
            {activeNode.children &&
                activeNode.children.map((child, index) => (
                    <Node
                        key={child.id}
                        node={child}
                        onClick={handleNodeClick}
                        onNavigate={handleNavigate}
                        isChild={true}
                        index={index}
                        total={activeNode.children.length}
                    />
                ))}
        </Box>
    );
};

export default GraphComponent;
