import React from 'react';
import { Box, Chip, styled } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';

const DetectedItemsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    minHeight: '32px', // Maintains space even when empty
}));

const StyledChip = styled(Chip)(({ theme, itemtype }) => ({
    backgroundColor:
        itemtype === 'url'
            ? theme.palette.info.light
            : theme.palette.primary.light,
    '& .MuiChip-label': {
        color: theme.palette.common.white,
    },
}));

const DetectedItems = ({
    detectedUrls,
    selectedMentions,
    onRemoveUrl,
    onRemoveMention,
}) => {
    return (
        <DetectedItemsContainer>
            {detectedUrls.map((url, index) => (
                <StyledChip
                    key={`url-${index}`}
                    label={url}
                    itemtype="url"
                    icon={<LinkIcon />}
                    onDelete={() => onRemoveUrl(url)}
                />
            ))}
            {Array.from(selectedMentions).map((mention, index) => (
                <StyledChip
                    key={`mention-${index}`}
                    label={mention.replace(/-/g, ' ')}
                    itemtype="mention"
                    icon={<PersonIcon />}
                    onDelete={() => onRemoveMention(mention)}
                />
            ))}
        </DetectedItemsContainer>
    );
};

export default DetectedItems;
