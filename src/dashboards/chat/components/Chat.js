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

const Chat = ({ agent, setIsChatOpen = null }) => {
    const nodeRef = useRef(null);
    const { messages, joinRoom } = useContext(ChatContext);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    useEffect(() => {
        joinRoom(agent.chatId);
    }, [joinRoom, agent.chatId]);

    // scrolls chat window to the bottom
    useEffect(() => {
        const node = nodeRef.current;
        node.scroll(0, node.scrollHeight);
    }, [messages]);


    return (
        <ChatContainerStyled>
            <ChatBar
                chatName={agent.chat_name}
                chatId={agent.chatId}
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                setIsChatOpen={setIsChatOpen}
            />
            <MessagesContainer xs={9} id="messages-container">
                <MessageArea ref={nodeRef}>
                    {messages[agent.chatId]?.map((message, index) => {
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
                <MessageInput chatSettings={agent} />
            </MessagesContainer>
            <AnimatePresence>
                {isSettingsOpen ? (
                    <ChatSettings
                        agent={agent}
                        setIsSettingsOpen={setIsSettingsOpen}
                    />
                ) : null}
            </AnimatePresence>
        </ChatContainerStyled>
    );
};

export default memo(Chat);
