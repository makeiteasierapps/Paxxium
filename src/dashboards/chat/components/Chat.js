import { memo, useContext, useMemo, useRef } from 'react';
import MessageInput from './MessageInput';
import ChatBar from './ChatBar';
import MessageList from './MessageList';
import {
    ScrollContainer,
    ScrollContent,
} from '../../../dashboards/insight/styledInsightComponents';
import { Button } from '@mui/material';
import { ContextManagerContext } from '../../../contexts/ContextManagerContext';
import { SettingsContext } from '../../../contexts/SettingsContext';
import { ChatContainerStyled } from '../chatStyledComponents';
import { useDropzone } from 'react-dropzone';

const Chat = ({ selectedChat, chatArray, setSelectedChatId, sx, type }) => {
    const { onDrop } = useContext(ContextManagerContext);
    const { loadedAvatarImage } = useContext(SettingsContext);
    const chatContainerRef = useRef(null);

    const { getRootProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
    });

    // Memoize messages to prevent unnecessary re-renders
    const messages = useMemo(
        () => selectedChat?.messages || [],
        [selectedChat]
    );

    // Switch to another chat
    const handleMenuClick = (event, chatId) => {
        setSelectedChatId(chatId);
    };

    return (
        <ChatContainerStyled
            id="chat-container"
            ref={chatContainerRef}
            sx={sx}
            {...getRootProps()}
            isDragActive={isDragActive}
        >
            {type !== 'insight' && <ChatBar type={type} />}

            {chatArray.length > 1 && (
                <ScrollContainer>
                    <ScrollContent alignItems="center">
                        {chatArray.map((chat) => (
                            <Button
                                key={chat.chatId}
                                variant={
                                    selectedChat.chatId === chat.chatId
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
                                        selectedChat.chatId === chat.chatId
                                            ? 'primary.main'
                                            : 'transparent',
                                    color:
                                        selectedChat.chatId === chat.chatId
                                            ? 'primary.contrastText'
                                            : 'primary.main',
                                    '&:hover': {
                                        backgroundColor:
                                            selectedChat.chatId === chat.chatId
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
            )}

            <MessageList
                id="message-list-container"
                messages={messages}
                loadedAvatarImage={loadedAvatarImage}
                selectedChatId={selectedChat?.chatId}
            />

            <MessageInput type={type} />
        </ChatContainerStyled>
    );
};

export default memo(Chat);
