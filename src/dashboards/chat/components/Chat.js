import { memo, useEffect, useRef, useState } from 'react';
import AgentMessage from './AgentMessage';
import MessageInput from './MessageInput';
import UserMessage from './UserMessage';
import { MessageArea, ChatContainerStyled } from '../chatStyledComponents';

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

    return (
        <ChatContainerStyled id="chat-container" sx={sx}>
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
                        />
                    );
                })}
            </MessageArea>
            <MessageInput onSendMessage={onSendMessage} />
        </ChatContainerStyled>
    );
};

export default memo(Chat);
