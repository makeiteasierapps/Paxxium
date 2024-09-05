import { Avatar } from '@mui/material';
import { useContext, useState, useEffect } from 'react';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { MessageContainer, MessageContent } from '../chatStyledComponents';

const UserMessage = ({ message }) => {
    console.log(message);
    const { avatar, backendUrl } = useContext(ProfileContext);
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        if (message.image_path instanceof Blob) {
            const objectUrl = URL.createObjectURL(message.image_path);
            setImageSrc(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof message.image_path === 'string') {
            setImageSrc(`${backendUrl}/images/${message.image_path}`);
        }
    }, [message.image_path, backendUrl]);

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
                    objectFit: 'contain',
                }}
            />
            {imageSrc && (
                <img
                    style={{
                        width: '90px',
                        height: 'auto',
                    }}
                    src={imageSrc}
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
