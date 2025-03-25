import { useRef, useEffect } from 'react';
import { MessageListItem, MessageContent } from '../chatStyledComponents';
import { Box } from '@mui/material';
const UserMessage = ({ message, loadedAvatarImage, onRender }) => {
    const messageRef = useRef(null);

    useEffect(() => {
        if (messageRef.current && onRender) {
            // Use requestAnimationFrame to ensure the DOM has been painted
            requestAnimationFrame(() => {
                if (messageRef.current) {
                    // Double-check ref is still valid
                    const height =
                        messageRef.current.getBoundingClientRect().height;
                    onRender(height);
                }
            });
        }
    }, [message.content, onRender]);
    return (
        <MessageListItem ref={messageRef} messageFrom="user">
            <Box>{message.content}</Box>
        </MessageListItem>
    );
};

export default UserMessage;
