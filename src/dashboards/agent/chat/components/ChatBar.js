import { useContext } from 'react';
import { Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import { AuthContext, backendUrl } from '../../../../auth/AuthContext';
import { ChatContext } from '../ChatContext';
import {
    handleClearMessages,
    handleDeleteChat,
    handleCloseChat,
} from '../handlers/chatBarHandlers';

import {
    Bar,
    ChatBarIcons,
    StyledIconButton,
} from '../../agentStyledComponents';

const ChatBar = ({ chatName, id }) => {
    const { setMessages, setAgentArray } = useContext(ChatContext);
    const { idToken } = useContext(AuthContext);
    return (
        <Bar>
            <Typography variant="h6">{chatName}</Typography>
            <ChatBarIcons>
                <StyledIconButton
                    disableRipple
                    aria-label="clear_chat"
                    onClick={() =>
                        handleClearMessages(
                            id,
                            idToken,
                            setMessages,
                            backendUrl
                        )
                    }
                >
                    <CommentsDisabledIcon />
                </StyledIconButton>
                <StyledIconButton
                    disableRipple
                    aria-label="delete"
                    onClick={() =>
                        handleDeleteChat(id, idToken, setAgentArray, backendUrl)
                    }
                >
                    <DeleteIcon />
                </StyledIconButton>
                <StyledIconButton
                    disableRipple
                    aria-label="close"
                    onClick={() =>
                        handleCloseChat(id, idToken, setAgentArray, backendUrl)
                    }
                >
                    <CloseIcon />
                </StyledIconButton>
            </ChatBarIcons>
        </Bar>
    );
};

export default ChatBar;
