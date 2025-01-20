import { Box, Chip, styled } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ArticleIcon from '@mui/icons-material/Article';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useContext } from 'react';
import { ContextManagerContext } from '../../../contexts/ContextManagerContext';
import { ChatContext } from '../../../contexts/ChatContext';

const DetectedItemsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    minHeight: '32px', // Maintains space even when empty
}));

const StyledChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'itemtype',
})(({ theme, itemtype }) => ({
    backgroundColor:
        itemtype === 'url'
            ? theme.palette.info.light
            : theme.palette.primary.light,
    '& .MuiChip-label': {
        color: theme.palette.common.white,
    },
}));

const DetectedItems = () => {
    const { removeContextItem } = useContext(ContextManagerContext);
    const { selectedChat } = useContext(ChatContext);
    const contextItems = selectedChat?.context || [];
    console.log('contextItems', contextItems);

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
            case 'file':
                return item.name;
            default:
                return '';
        }
    };

    const handleDelete = (item) => {
        removeContextItem(item.type, item.type === 'url' ? item.source : item);
    };

    return (
        <DetectedItemsContainer>
            {contextItems.map((item) => (
                <StyledChip
                    key={item.id}
                    label={getChipLabel(item)}
                    itemtype={item.type}
                    icon={getIconByType(item.type)}
                    onDelete={() => handleDelete(item)}
                />
            ))}
        </DetectedItemsContainer>
    );
};

export default DetectedItems;
