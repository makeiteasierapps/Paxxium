import { useState, useRef } from 'react';
import { Box } from '@mui/material';
import { useWindowSize } from '../../../hooks/useWindowSize';
import QuestionNode from './QuestionNode';
import RootNode from './RootNode';
import CategoryNode from './CategoryNode';
import QaNode from './QaNode';

const Node = ({
    node,
    onClick,
    onNavigate,
    isActive,
    isChild,
    index,
    total,
}) => {
    const { width, height } = useWindowSize();
    const [isHovered, setIsHovered] = useState(false);
    const nodeRef = useRef(null);

    const handleClick = () => onClick(node.id);

    let x = 0,
        y = 0;
    if (isChild) {
        const radius = Math.min(width, height) * 0.3;
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
    }

    const renderNode = () => {
        switch (node.type) {
            case 'root':
                return <RootNode node={node} onClick={handleClick} />;
            case 'category':
                return <CategoryNode node={node} onClick={handleClick} />;
            case 'question':
                return isActive ? (
                    <QaNode node={node} onClick={handleClick} onNavigate={onNavigate} />
                ) : (
                    <QuestionNode node={node} onClick={handleClick} />
                );
            default:
                return null;
        }
    };

    return (
        <Box
            ref={nodeRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                position: 'absolute',
                left: isActive ? '50%' : `calc(50% + ${x}px)`,
                top: isActive ? '50%' : `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.3s ease-in-out',
                zIndex: isHovered ? 9999 : 1,
            }}
        >
            {renderNode()}
        </Box>
    );
};

export default Node;
