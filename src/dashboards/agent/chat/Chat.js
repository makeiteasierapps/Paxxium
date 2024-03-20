import { memo, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatContext } from '../../../dashboards/agent/chat/ChatContext';
import { formatBlockMessage } from '../utils/messageFormatter';
import AgentMessage from './components/AgentMessage';
import ChatSettings from '../chat/components/ChatSettings';
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

    // Fetch messages from the database
    useEffect(() => {
        loadMessages(chatId);
    }, [chatId, loadMessages]);

    // scrolls chat window to the bottom
    useEffect(() => {
        const node = nodeRef.current;
        node.scroll(0, node.scrollHeight);
    }, [messages]);

    return (
        <ChatContainerStyled>
            <ChatBar
                chatName={chatName}
                chatId={chatId}
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
            />
            <MessagesContainer xs={9} id="messages-container">
                <MessageArea ref={nodeRef}>
                    {messages[chatId]?.map((message, index) => {
                        let formattedMessage = message;
                        if (message.type === 'database') {
                            if (message.message_from === 'agent') {
                                formattedMessage = formatBlockMessage(message);
                                return (
                                    <AgentMessage
                                        key={`agent${index}`}
                                        message={formattedMessage}
                                        id={chatId}
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
                    chatId={chatId}
                    agentModel={agentModel}
                    systemPrompt={systemPrompt}
                    chatConstants={chatConstants}
                    useProfileData={useProfileData}
                />
            </MessagesContainer>
            <AnimatePresence>
                {isSettingsOpen ? (
                    <ChatSettings
                        chatId={chatId}
                        chatConstants={chatConstants}
                        systemPrompt={systemPrompt}
                        chatName={chatName}
                        agentModel={agentModel}
                        useProfileData={useProfileData}
                        setIsSettingsOpen={setIsSettingsOpen}
                    />
                ) : null}
            </AnimatePresence>
        </ChatContainerStyled>
    );
};

export default memo(Chat);
