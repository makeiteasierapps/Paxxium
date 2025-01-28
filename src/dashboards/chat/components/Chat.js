import { memo, useEffect, useRef, useState, useContext } from 'react';
import AgentMessage from './AgentMessage';
import MessageInput from './MessageInput';
import UserMessage from './UserMessage';
import { ContextManagerContext } from '../../../contexts/ContextManagerContext';
import { MessageArea, ChatContainerStyled } from '../chatStyledComponents';
import { useDropzone } from 'react-dropzone';

const Chat = ({ messages, sx, type = 'user' }) => {
    const { onDrop } = useContext(ContextManagerContext);
    const messageAreaRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const { getRootProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
    });

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
            <MessageInput type={type} />
        </ChatContainerStyled>
    );
};

export default memo(Chat);
