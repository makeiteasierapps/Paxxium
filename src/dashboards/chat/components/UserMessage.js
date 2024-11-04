import { Avatar, ListItem } from '@mui/material';
import { useContext } from 'react';
import { SettingsContext } from '../../../contexts/SettingsContext';
import { MessageContent } from '../chatStyledComponents';

const UserMessage = ({ message, className }) => {
    // Add className prop
    const { userAvatarImg, backendUrl } = useContext(SettingsContext);

    return (
        <ListItem className={className} messageFrom="user">
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
        </ListItem>
    );
};

export default UserMessage;
