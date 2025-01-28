import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import {
    ScrollContainer,
    ScrollContent,
} from '../insight/styledInsightComponents';
import { Box, Grid, Button } from '@mui/material';
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

const SystemAgent = () => {
    const {
        selectedSystemChat,
        systemChatArray,
        setSelectedSystemChatId,
    } = useContext(SystemContext);

    const handleMenuClick = (event, chatId) => {
        setSelectedSystemChatId(chatId);
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
                <ScrollContainer>
                    <ScrollContent alignItems="center">
                        {systemChatArray.map((chat) => (
                            <Button
                                variant={
                                    selectedSystemChat.chatId === chat.chatId
                                        ? 'contained'
                                        : 'outlined'
                                }
                                onClick={(e) => handleMenuClick(e, chat.chatId)}
                                sx={{
                                    mx: 1,
                                    minWidth: 'max-content',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    backgroundColor:
                                        selectedSystemChat.chatId ===
                                        chat.chatId
                                            ? 'primary.main'
                                            : 'transparent',
                                    color:
                                        selectedSystemChat.chatId ===
                                        chat.chatId
                                            ? 'primary.contrastText'
                                            : 'primary.main',
                                    '&:hover': {
                                        backgroundColor:
                                            selectedSystemChat.chatId ===
                                            chat.chatId
                                                ? 'primary.dark'
                                                : 'primary.light',
                                    },
                                }}
                            >
                                {chat.chat_name}
                            </Button>
                        ))}
                    </ScrollContent>
                </ScrollContainer>
                <ChatBar type="system" />
                <Chat
                    messages={selectedSystemChat?.messages}
                    sx={sx}
                    type="system"
                />
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
            ></Grid>
        </>
    );
};

export default SystemAgent;
