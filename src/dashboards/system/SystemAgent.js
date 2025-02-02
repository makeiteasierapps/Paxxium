import React, { useContext, useState } from 'react';
import { SystemContext } from '../../contexts/SystemContext';
import Chat from '../chat/components/Chat';
import { Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MainContext } from '../../contexts/MainContext';
const GlassmorphicButton = styled(Button, {
    shouldForwardProp: (prop) => !['isopen', 'isDrawerExpanded'].includes(prop),
})(({ theme, isopen, isDrawerExpanded }) => ({
    position: 'fixed',
    left: isDrawerExpanded ? '150px' : '50px',
    top: '200px',
    backgroundColor: 'rgba(144, 202, 249, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderLeft: 'none',
    borderRadius: '0 8px 8px 0',
    color: theme.palette.text.primary,
    minWidth: '40px',
    height: '80px',
    writingMode: 'vertical-rl',
    padding: 0,
    '&:hover': {
        backgroundColor: 'rgba(144, 202, 249, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
    [theme.breakpoints.down('sm')]: {
        left: 0,
        top: '100px',
    },
    zIndex: 1000,
}));

const SystemAgent = () => {
    const { selectedSystemChat, systemChatArray, setSelectedSystemChatId } =
        useContext(SystemContext);
    const { isDrawerExpanded } = useContext(MainContext);
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <Box>
            <GlassmorphicButton
                onClick={() => setIsChatOpen(!isChatOpen)}
                variant="contained"
                isopen={isChatOpen}
                isDrawerExpanded={isDrawerExpanded}
            >
                {isChatOpen ? 'Close' : 'Chat'}
            </GlassmorphicButton>
            {isChatOpen && (
                <Chat
                    selectedChat={selectedSystemChat}
                    type="system"
                    chatArray={systemChatArray}
                    setSelectedChatId={setSelectedSystemChatId}
                    sx={{ height: '90vh' }}
                />
            )}
        </Box>
    );
};
export default SystemAgent;
