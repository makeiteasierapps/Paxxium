import { Avatar } from '@mui/material';
import { useRef, useEffect } from 'react';
import {
    MessageListItem,
    MessageContent,
    StyledUserAvatar,
} from '../chatStyledComponents';

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
            <StyledUserAvatar>
                <Avatar src={loadedAvatarImage} />
            </StyledUserAvatar>
            <MessageContent>{message.content}</MessageContent>
        </MessageListItem>
    );
};

export default UserMessage;