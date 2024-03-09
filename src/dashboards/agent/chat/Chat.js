import { memo, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import { ChatContext } from '../../../dashboards/agent/chat/ChatContext';
import { formatBlockMessage } from '../utils/messageFormatter';
import AgentMessage from './components/AgentMessage';
import ChatBar from './components/ChatBar';
import MessageInput from './components/MessageInput';
import UserMessage from './components/UserMessage';
import {
    MessagesContainer,
    MessageArea,
    ChatContainerStyled,
} from '../agentStyledComponents';

const Chat = ({
    id,
    chatConstants,
    systemPrompt,
    chatName,
    agentModel,
    useProfileData,
}) => {
    const nodeRef = useRef(null);
    const { messages, setMessages, setSelectedAgent, agentArray } =
        useContext(ChatContext);

    const { idToken } = useContext(AuthContext);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? process.env.REACT_APP_MESSAGES_URL
            : process.env.REACT_APP_BACKEND_URL_PROD;

    // Fetch messages from the database
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const messageResponse = await fetch(`${backendUrl}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: idToken,
                    },
                    body: JSON.stringify({ id: id }),
                });

                if (!messageResponse.ok) {
                    throw new Error('Failed to load messages');
                }

                const messageData = await messageResponse.json();
                if (messageData && messageData.messages.length > 0) {
                    setMessages((prevMessageParts) => ({
                        ...prevMessageParts,
                        [id]: messageData.messages,
                    }));
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchMessages();
    }, [
        agentModel,
        chatConstants,
        chatName,
        id,
        idToken,
        setMessages,
        systemPrompt,
        useProfileData,
    ]);

    // scrolls chat window to the bottom
    useEffect(() => {
        const node = nodeRef.current;
        node.scroll(0, node.scrollHeight);
    }, [messages]);

    return (
        <ChatContainerStyled
            onClick={() => {
                const selectedAgent = agentArray.find(
                    (agent) => agent.id === id
                );
                setSelectedAgent(selectedAgent);
            }}
        >
            <ChatBar
                chatName={chatName}
                id={id}
                idToken={idToken}
                backendUrl={backendUrl}
            />
            <MessagesContainer xs={9} id="messages-container">
                <MessageArea ref={nodeRef}>
                    {messages[id]?.map((message, index) => {
                        let formattedMessage = message;
                        if (message.type === 'database') {
                            if (message.message_from === 'agent') {
                                formattedMessage = formatBlockMessage(message);
                                return (
                                    <AgentMessage
                                        key={`agent${index}`}
                                        message={formattedMessage}
                                        id={id}
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
                    chatId={id}
                    agentModel={agentModel}
                    systemPrompt={systemPrompt}
                    chatConstants={chatConstants}
                    useProfileData={useProfileData}
                />
            </MessagesContainer>
        </ChatContainerStyled>
    );
};

export default memo(Chat);
