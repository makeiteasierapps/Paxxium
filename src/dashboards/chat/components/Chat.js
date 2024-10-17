import { memo, useEffect, useRef, useState } from 'react';
import AgentMessage from './AgentMessage';
import MessageInput from './MessageInput';
import UserMessage from './UserMessage';
import {
    MessagesContainer,
    MessageArea,
    ChatContainerStyled,
} from '../chatStyledComponents';

const Chat = ({messages, onSendMessage}) => {
    const nodeRef = useRef(null);
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
            <ChatContainerStyled>
                <MessagesContainer xs={9} id="messages-container">
                    <MessageArea ref={nodeRef} onScroll={handleScroll}>
                        {messages?.map(
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
                    <MessageInput onSendMessage={onSendMessage} />
                </MessagesContainer>
            </ChatContainerStyled>
        </>
    );
};

export default memo(Chat);
