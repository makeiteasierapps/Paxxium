import { memo, useEffect, useRef, useState } from 'react';
import AgentMessage from './AgentMessage';
import MessageInput from './MessageInput';
import UserMessage from './UserMessage';
import { ContextManagerProvider } from '../../../contexts/ContextManagerContext';
import { MessageArea, ChatContainerStyled } from '../chatStyledComponents';
import { useDropzone } from 'react-dropzone';
import { useImageHandling } from '../../../hooks/chat/useImageHandling';

const Chat = ({ messages, sx }) => {
    const { onDrop } = useImageHandling();
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
        <ContextManagerProvider>
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
                <MessageInput />
            </ChatContainerStyled>
        </ContextManagerProvider>
    );
};

export default memo(Chat);
