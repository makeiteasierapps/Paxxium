import { memo, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatContext } from './ChatContext';
import { formatBlockMessage } from '../utils/messageFormatter';
import AgentMessage from './components/AgentMessage';
import ChatSettings from './components/ChatSettings';
import ChatBar from './components/ChatBar';
import MessageInput from './components/MessageInput';
import UserMessage from './components/UserMessage';
import {
    MessagesContainer,
    MessageArea,
    ChatContainerStyled,
} from '../agentStyledComponents';

const Chat = ({
    chatId,
    chatConstants,
    systemPrompt,
    chatName,
    agentModel,
    useProfileData,
}) => {
    const nodeRef = useRef(null);
    const { messages, loadMessages } = useContext(ChatContext);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const isProjectChat = chatId.startsWith('project-');

    // If chatId contains 'project-', remove it for further use
    const adjustedChatId = isProjectChat
        ? chatId.replace('project-', '')
        : chatId;

    // Fetch messages from the database
    useEffect(() => {
        loadMessages(adjustedChatId);
    }, [adjustedChatId, loadMessages]);

    // scrolls chat window to the bottom
    useEffect(() => {
        const node = nodeRef.current;
        node.scroll(0, node.scrollHeight);
    }, [messages]);

    return (
        <ChatContainerStyled>
            <ChatBar
                chatName={chatName}
                chatId={adjustedChatId}
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
            />
            <MessagesContainer xs={9} id="messages-container">
                <MessageArea ref={nodeRef}>
                    {messages[adjustedChatId]?.map((message, index) => {
                        let formattedMessage = message;
                        if (message.type === 'database') {
                            if (message.message_from === 'agent') {
                                formattedMessage = formatBlockMessage(message);
                                return (
                                    <AgentMessage
                                        key={`agent${index}`}
                                        message={formattedMessage}
                                        id={adjustedChatId}
                                    />
                                );
                            } else {
                                return (
                                    <UserMessage
                                        key={`user${index}`}
                                        message={message}
                                    />
                                );
                            }
                        } else {
                            return (
                                <AgentMessage
                                    key={`stream${index}`}
                                    message={message}
                                />
                            );
                        }
                    })}
                </MessageArea>
                <MessageInput
                    isProjectChat={isProjectChat}
                    chatId={adjustedChatId}
                    agentModel={agentModel}
                    systemPrompt={systemPrompt}
                    chatConstants={chatConstants}
                    useProfileData={useProfileData}
                />
            </MessagesContainer>
            <AnimatePresence>
                {isSettingsOpen ? (
                    <ChatSettings
                        chatId={adjustedChatId}
                        chatConstants={chatConstants}
                        systemPrompt={systemPrompt}
                        chatName={chatName}
                        agentModel={agentModel}
                        useProfileData={useProfileData}
                        setIsSettingsOpen={setIsSettingsOpen}
                        isSettingsOpen={isSettingsOpen}
                    />
                ) : null}
            </AnimatePresence>
        </ChatContainerStyled>
    );
};

export default memo(Chat);
