import React, { useState, useContext, useCallback } from 'react';
import { ProfileContext } from '../../../contexts/ProfileContext';
import Node from './Node';

const Graph = () => {
    const { nodes, isLoading, error, updateNode } = useContext(ProfileContext);
    const [centerNode, setCenterNode] = useState(null);

    const rootNode = nodes.find((node) => node.type === 'root');

    const handleNodeClick = useCallback(
        (node) => {
            updateNode(node.id, { isExpanded: !node.isExpanded });
            setCenterNode(node);
        },
        [updateNode]
    );

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div
            className="graph"
            style={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                border: '1px solid black',
                overflow: 'hidden',
                background: 'black',
            }}
        >
            {(centerNode || rootNode) && (
                <Node
                    node={centerNode || rootNode}
                    x={window.innerWidth / 2}
                    y={window.innerHeight / 2}
                    onNodeClick={handleNodeClick}
                    isCenter={true}
                />
            )}
        </div>
    );
};

export default Graph;
