import { memo, useEffect, useRef, useState } from 'react';
import AgentMessage from './AgentMessage';
import MessageInput from './MessageInput';
import UserMessage from './UserMessage';
import {
    MessagesContainer,
    MessageArea,
    ChatContainerStyled,
} from '../chatStyledComponents';

// ... existing imports ...

const Chat = ({ messages, onSendMessage, sx }) => {
    const messageAreaRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

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

    const renderMessage = (message, index) => {
        const MessageComponent =
            message.message_from === 'user' ? UserMessage : AgentMessage;

        return (
            <MessageComponent
                key={`${message.message_from}-${index}`}
                message={message}
            />
        );
    };

    return (
        <ChatContainerStyled sx={sx}>
            <MessagesContainer>
                <MessageArea ref={messageAreaRef} onScroll={handleScroll}>
                    {messages?.map(renderMessage)}
                </MessageArea>
                <MessageInput onSendMessage={onSendMessage} />
            </MessagesContainer>
        </ChatContainerStyled>
    );
};

export default memo(Chat);
