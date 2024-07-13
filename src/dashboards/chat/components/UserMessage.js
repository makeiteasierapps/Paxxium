import { Avatar } from '@mui/material';
import { useContext } from 'react';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { MessageContainer, MessageContent } from '../chatStyledComponents';

const UserMessage = ({ message }) => {
    const { avatar } = useContext(ProfileContext);

    return (
        <MessageContainer messageFrom="user">
            <Avatar
                variant="rounded"
                src={avatar}
                sx={{
                    margin: '0px 13px 0px 0px',
                    width: '33px',
                    height: '33px',
                    backgroundColor: 'transparent',
                }}
                imgProps={{
                    style: { objectFit: 'contain' },
                }}
            />
            {message.image_url && (
                <img
                    style={{
                        width: '90px',
                        height: 'auto',
                    }}
                    src={message.image_url}
                    alt="message content"
                />
            )}

            <MessageContent imageUrl={message.image_url}>
                {message.content}
            </MessageContent>
        </MessageContainer>
    );
};

export default UserMessage;
