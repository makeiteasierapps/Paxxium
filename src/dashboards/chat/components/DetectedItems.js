import { useContext } from 'react';
import { Chip, styled, alpha, Tooltip } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ArticleIcon from '@mui/icons-material/Article';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ContextManagerContext } from '../../../contexts/ContextManagerContext';
import {
    ScrollContainer,
    ScrollContent,
} from '../../insight/styledInsightComponents';

const StyledChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'itemtype',
})(({ theme, itemtype }) => ({
    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
    backdropFilter: 'blur(8px)',
    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
    boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
    maxWidth: '200px',
    transition: 'all 0.2s ease',
    '& .MuiChip-label': {
        color: theme.palette.text.primary,
        fontSize: '0.875rem',
    },
    '& .MuiChip-icon, & .MuiChip-deleteIcon': {
        color: alpha(theme.palette.text.primary, 0.7),
    },
    '&:hover': {
        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 6px ${alpha(theme.palette.common.black, 0.15)}`,
    },
}));

const DetectedItems = ({ selectedChat }) => {
    const { removeContextItem } = useContext(ContextManagerContext);

    const getIconByType = (type) => {
        switch (type) {
            case 'url':
                return <LinkIcon />;
            case 'kb':
                return <ArticleIcon />;
            case 'file':
                return <AttachFileIcon />;
            default:
                return null;
        }
    };

    const getChipLabel = (item) => {
        switch (item.type) {
            case 'url':
                return item.source;
            case 'kb':
            case 'image':
                return item.name;
            case 'file':
                return item.name;
            default:
                return '';
        }
    };

    const handleDelete = (item) => {
        removeContextItem(item.type, item);
    };

    return (
        <ScrollContainer>
            <ScrollContent sx={{ marginTop: '0.5rem', gap: '0.5rem', justifyContent: 'center' }}>
                {selectedChat?.context?.map((item, index) => (
                    <Tooltip
                        key={index}
                        title={getChipLabel(item)}
                        enterDelay={500}
                        placement="top"
                    >
                        <StyledChip
                            label={getChipLabel(item)}
                            itemtype={item.type}
                            icon={getIconByType(item.type)}
                            onDelete={() => handleDelete(item)}
                        />
                    </Tooltip>
                ))}
            </ScrollContent>
        </ScrollContainer>
    );
};

export default DetectedItems;
