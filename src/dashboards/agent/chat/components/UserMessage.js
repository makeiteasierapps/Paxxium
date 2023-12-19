import { Avatar } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { useContext } from 'react';
import { ProfileContext } from '../../../profile/ProfileContext';

import { MessageContainer, MessageContent } from '../../agentStyledComponents';

import { StyledAvatar } from '../../../profile/styledProfileComponents';

const UserMessage = ({ message }) => {
    const { avatar } = useContext(ProfileContext);

    return (
        <MessageContainer
            style={{
                backgroundColor:
                    message.message_from === 'user'
                        ? blueGrey[800]
                        : blueGrey[700],
            }}
        >
            <StyledAvatar
                src={avatar}
                sx={{
                    width: '33px',
                    height: '33px',
                    bgcolor: '#1C282E',
                    margin: '0px 13px 0px 0px',
                    color: blueGrey[700],
                }}
            />

            <MessageContent>{message.content}</MessageContent>
        </MessageContainer>
    );
};

export default UserMessage;
