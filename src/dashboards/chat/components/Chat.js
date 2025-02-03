import { memo, useEffect, useRef, useState, useContext, useMemo } from 'react';
import AgentMessage from './AgentMessage';
import MessageInput from './MessageInput';
import UserMessage from './UserMessage';
import ChatBar from './ChatBar';
import {
    ScrollContainer,
    ScrollContent,
} from '../../../dashboards/insight/styledInsightComponents';
import { Button } from '@mui/material';
import { ContextManagerContext } from '../../../contexts/ContextManagerContext';
import { SettingsContext } from '../../../contexts/SettingsContext';
import { MessageArea, ChatContainerStyled } from '../chatStyledComponents';
import { useDropzone } from 'react-dropzone';

const Chat = ({
    selectedChat,
    chatArray,
    setSelectedChatId,
    sx,
    type = 'user',
}) => {
    const { onDrop } = useContext(ContextManagerContext);
    const { loadedAvatarImage } = useContext(SettingsContext);
    const messageAreaRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const { getRootProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
    });
    const messages = useMemo(
        () => selectedChat?.messages || [],
        [selectedChat]
    );
    const handleMenuClick = (event, chatId) => {
        setSelectedChatId(chatId);
    };

    useEffect(() => {
        if (shouldAutoScroll && messageAreaRef.current) {
            const node = messageAreaRef.current;
            node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, shouldAutoScroll]);

    const handleScroll = () => {
        const node = messageAreaRef.current;
        const isAtBottom =
            Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop) <=
            1;
        setShouldAutoScroll(isAtBottom);
    };

    return (
        <ChatContainerStyled
            id="chat-container"
            sx={sx}
            {...getRootProps()}
            isDragActive={isDragActive}
        >
            <ChatBar type={type} />
            <ScrollContainer>
                <ScrollContent alignItems="center">
                    {chatArray.map((chat) => (
                        <Button
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

            <MessageArea ref={messageAreaRef} onScroll={handleScroll}>
                {messages?.map((message, index) => {
                    const MessageComponent =
                        message.message_from === 'user'
                            ? UserMessage
                            : AgentMessage;
                    return (
                        <MessageComponent
                            className="message-item"
                            key={`${message.message_from}-${index}`}
                            message={message}
                            loadedAvatarImage={loadedAvatarImage}
                        />
                    );
                })}
            </MessageArea>
            <MessageInput />
        </ChatContainerStyled>
    );
};

export default memo(Chat);
