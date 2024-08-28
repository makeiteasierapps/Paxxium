import { memo, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatContext } from '../../../contexts/ChatContext';
import AgentMessage from './AgentMessage';
import ChatSettings from './ChatSettings';
import ChatBar from './ChatBar';
import MessageInput from './MessageInput';
import UserMessage from './UserMessage';
import {
    MessagesContainer,
    MessageArea,
    ChatContainerStyled,
} from '../chatStyledComponents';

const Chat = () => {
    const nodeRef = useRef(null);
    const { messages, selectedChat } = useContext(ChatContext);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // scrolls chat window to the bottom
    useEffect(() => {
        if (shouldAutoScroll) {
            const node = nodeRef.current;
            node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, shouldAutoScroll]);

    const handleScroll = () => {
        const node = nodeRef.current;
        const isScrolledToBottom =
            node.scrollHeight - node.clientHeight <= node.scrollTop + 1;
        setShouldAutoScroll(isScrolledToBottom);
    };

    return (
        <>
            <ChatBar
                chatName={selectedChat.chat_name}
                chatId={selectedChat.chatId}
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
            />
            <ChatContainerStyled>
                <MessagesContainer xs={9} id="messages-container">
                    <MessageArea ref={nodeRef} onScroll={handleScroll}>
                        {messages[selectedChat.chatId]?.map(
                            (message, index) => {
                                if (message.message_from === 'user') {
                                    return (
                                        <UserMessage
                                            key={`user${index}`}
                                            message={message}
                                        />
                                    );
                                }
                                return (
                                    <AgentMessage
                                        key={`stream${index}`}
                                        message={message}
                                    />
                                );
                            }
                        )}
                    </MessageArea>
                    <MessageInput chatSettings={selectedChat} />
                </MessagesContainer>
            </ChatContainerStyled>
        </>
    );
};

export default memo(Chat);
