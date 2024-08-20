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


    // scrolls chat window to the bottom
    useEffect(() => {
        const node = nodeRef.current;
        node.scroll(0, node.scrollHeight);
    }, [messages]);

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
                    <MessageArea ref={nodeRef}>
                        {messages[selectedChat.chatId]?.map((message, index) => {
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
                        })}
                    </MessageArea>
                    <MessageInput chatSettings={selectedChat} />
                </MessagesContainer>
                <AnimatePresence>
                    {isSettingsOpen ? (
                        <ChatSettings
                            selectedChat={selectedChat}
                            setIsSettingsOpen={setIsSettingsOpen}
                        />
                    ) : null}
                </AnimatePresence>
            </ChatContainerStyled>
        </>
    );
};

export default memo(Chat);
