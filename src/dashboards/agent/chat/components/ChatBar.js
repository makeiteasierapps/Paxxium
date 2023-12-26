import { useContext, useState } from 'react';
import { Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

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
    CloseIconButton,
} from '../../agentStyledComponents';

const ChatBar = ({ chatName, id }) => {
    const { setMessages, setAgentArray } = useContext(ChatContext);
    const { idToken } = useContext(AuthContext);

    const [deleteClicked, setDeleteClicked] = useState(false);

    const handleDeleteClick = () => {
        if (deleteClicked) {
            handleDeleteChat(id, idToken, setAgentArray, backendUrl);
        } else {
            setDeleteClicked(true);
            setTimeout(() => {
                setDeleteClicked(false);
            }, 3000);
        }
    };

    return (
        <Bar>
            <CloseIconButton
                disableRipple
                aria-label="close"
                onClick={() =>
                    handleCloseChat(id, idToken, setAgentArray, backendUrl)
                }
            >
                <CloseIcon sx={{ fontSize: '1rem' }} />
            </CloseIconButton>
            <Typography variant="h6">{chatName}</Typography>
            <ChatBarIcons>
                <Tooltip title="Clear Chat" placement="top">
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
                </Tooltip>
                <Tooltip
                    title={
                        deleteClicked
                            ? 'Are you sure? Click again to confirm'
                            : ''
                    }
                    open={deleteClicked}
                    placement="top"
                >
                    <StyledIconButton
                        disableRipple
                        aria-label="delete"
                        onClick={handleDeleteClick}
                        style={{ color: deleteClicked ? 'red' : '#b0bec5' }}
                    >
                        <DeleteIcon />
                    </StyledIconButton>
                </Tooltip>
            </ChatBarIcons>
        </Bar>
    );
};

export default ChatBar;
