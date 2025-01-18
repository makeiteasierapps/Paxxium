import { useMemo } from 'react';
import { Box, Chip, styled } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import { useContext } from 'react';
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
    const {
        selectedMentions,
        handleRemoveMention,
        handleRemoveUrl,
        getSelectedChat,
    } = useContext(ChatContext);

    const selectedChat = useMemo(() => getSelectedChat(), [getSelectedChat]);
    const contextUrls = selectedChat?.context_urls || [];

    return (
        <DetectedItemsContainer>
            {contextUrls.map((url, index) => (
                <StyledChip
                    key={`url-${url}-${index}`} // More specific key to help with updates
                    label={url}
                    itemtype="url"
                    icon={<LinkIcon />}
                    onDelete={() => handleRemoveUrl(url)}
                />
            ))}
            {Array.from(selectedMentions).map((mention, index) => (
                <StyledChip
                    key={`mention-${mention}-${index}`}
                    label={mention.replace(/-/g, ' ')}
                    itemtype="mention"
                    icon={<PersonIcon />}
                    onDelete={() => handleRemoveMention(mention)}
                />
            ))}
        </DetectedItemsContainer>
    );
};

export default DetectedItems;
