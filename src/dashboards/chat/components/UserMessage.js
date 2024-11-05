import { Avatar, ListItem } from '@mui/material';
import { useContext } from 'react';
import { SettingsContext } from '../../../contexts/SettingsContext';
import { MessageListItem ,MessageContent } from '../chatStyledComponents';

const UserMessage = ({ message }) => {
    
    const { userAvatarImg, backendUrl } = useContext(SettingsContext);

    return (
        <MessageListItem messageFrom="user">
            <Avatar
                variant="rounded"
                src={`${backendUrl}/images/${userAvatarImg}`}
                sx={{
                    margin: '0px 13px 0px 0px',
                    width: '33px',
                    height: '33px',
                    backgroundColor: 'transparent',
                    objectFit: 'contain',
                }}
            />
            <MessageContent>{message.content}</MessageContent>
        </MessageListItem>
    );
};

export default UserMessage;
