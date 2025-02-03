import { Avatar } from '@mui/material';
import { useContext } from 'react';
import { SettingsContext } from '../../../contexts/SettingsContext';
import {
    MessageListItem,
    MessageContent,
    StyledUserAvatar,
} from '../chatStyledComponents';

const UserMessage = ({ message, loadedAvatarImage }) => {
    return (
        <MessageListItem messageFrom="user">
            <StyledUserAvatar>
                <Avatar src={loadedAvatarImage} />
            </StyledUserAvatar>
            <MessageContent>{message.content}</MessageContent>
        </MessageListItem>
    );
};

export default UserMessage;