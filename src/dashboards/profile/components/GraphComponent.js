import React, { useMemo, useContext } from 'react';
import { ProfileContext } from '../../../contexts/ProfileContext';
import Node from './Node';

const Graph = () => {
    const { nodes, isLoading, error } = useContext(ProfileContext);

    const rootNode = useMemo(
        () => nodes.find((node) => node.type === 'root'),
        [nodes]
    );

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="graph">
            <svg width="1000" height="1000">
                {rootNode && <Node node={rootNode} x={500} y={50} />}
            </svg>
        </div>
    );
};

export default Graph;