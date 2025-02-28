import React, { memo } from 'react';
import UserMessage from './UserMessage';
import AgentMessage from './AgentMessage';
import { MessageArea } from '../chatStyledComponents';

const MessageList = ({ messages, loadedAvatarImage, messageAreaRef, handleScroll }) => {
    return (
        <MessageArea ref={messageAreaRef} onScroll={handleScroll}>
            {messages.map((message, index) => {
                const MessageComponent =
                    message.message_from === 'user' ? UserMessage : AgentMessage;
                return (
                    <MessageComponent
                        className="message-item"
                        key={`${message.message_from}-${index}`}
                        message={message}
                        loadedAvatarImage={loadedAvatarImage}
                    />
                );
            })}
        </MessageArea>
    );
};

export default memo(MessageList);