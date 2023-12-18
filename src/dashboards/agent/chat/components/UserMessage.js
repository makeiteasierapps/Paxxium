import { Avatar, ListItemIcon } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { useState, useContext } from 'react';
import { ProfileContext } from '../../../profile/ProfileContext';

import {
    MessageContainer,
    MessageContent,
    StyledHeader,
    StyledCheckbox,
} from '../../agentStyledComponents';

const UserMessage = ({ message }) => {
    const [checked, setChecked] = useState(false);
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
            <StyledHeader>
                <ListItemIcon>
                    <Avatar
                        src={avatar}
                        sx={{
                            width: '33px',
                            height: '39px',
                            bgcolor: '#1C282E',
                            color: blueGrey[700],
                            
                        }}
                    />
                </ListItemIcon>
                <StyledCheckbox
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                    inputProps={{ 'aris-label': 'Select message' }}
                />
            </StyledHeader>
            <MessageContent>{message.content}</MessageContent>
        </MessageContainer>
    );
};

export default UserMessage;
