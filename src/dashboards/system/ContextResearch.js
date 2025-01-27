import { useContext, useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Typography, Box, Grid, Button } from '@mui/material';
import { SystemContext } from '../../contexts/SystemContext';
import Chat from '../chat/components/Chat';
import ChatBar from '../chat/components/ChatBar';

const FileItem = styled(Box)(({ theme, selected }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0 3px',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: selected ? theme.palette.background.user : 'transparent',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: selected
            ? theme.palette.action.selected
            : theme.palette.action.hover,
    },
}));

const SystemAgentButton = styled(Button)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    textTransform: 'none',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const ContextResearch = () => {
    const {
        selectedSystemChat,
        createChat,
    } = useContext(SystemContext);

    const [showChat, setShowChat] = useState(false);

    const handleSystemAgentClick = () => {
        createChat();
        setShowChat(true);
    };

    const sx = {
        width: '100%',
        p: 2,
        margin: '0 auto',
        height: '60vh',
        overflow: 'auto',
    };

    return (
        <>
            <Box width="100%" p={2}>
                {!showChat ? (
                    <SystemAgentButton onClick={handleSystemAgentClick}>
                        Ask the SystemAgent...
                    </SystemAgentButton>
                ) : (
                    <>
                        <ChatBar />
                        <Chat messages={selectedSystemChat?.messages} sx={sx} />
                    </>
                )}
            </Box>
            <Grid
                container
                justifyContent="center"
                spacing={1}
                sx={{
                    p: 1,
                    width: 'auto',
                    margin: '0 auto',
                    maxWidth: '500px',
                }}
            >
            </Grid>
        </>
    );
};

export default ContextResearch;
