import { useContext, useState } from 'react';
import { Typography, Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import { AuthContext } from '../../../../auth/AuthContext';
import { ChatContext } from '../ChatContext';
import {
    handleClearMessages,
    handleDeleteChat,
    handleCloseChat,
} from '../handlers/chatBarHandlers';

import {
    Bar,
    ClearAndTrashIcons,
    StyledIconButton,
    CloseIconButton,
} from '../../agentStyledComponents';

const ChatBar = ({ chatName, id }) => {
    const { setMessages, setAgentArray } = useContext(ChatContext);
    const { idToken } = useContext(AuthContext);

    const [deleteClicked, setDeleteClicked] = useState(false);

    const handleDeleteClick = () => {
        if (deleteClicked) {
            handleDeleteChat(id, idToken, setAgentArray);
        } else {
            setDeleteClicked(true);
            setTimeout(() => {
                setDeleteClicked(false);
            }, 3000);
        }
    };

    return (
        <Bar>
            <Box display="flex" justifyContent="flex-start" width="33%">
                <CloseIconButton
                    disableRipple
                    aria-label="close"
                    onClick={() =>
                        handleCloseChat(id, idToken, setAgentArray)
                    }
                >
                    <CloseIcon sx={{ fontSize: '1rem' }} />
                </CloseIconButton>
            </Box>
            <Box display="flex" justifyContent="center" width="33%">
                <Typography variant="h6">{chatName}</Typography>
            </Box>
            <Box display="flex" justifyContent="flex-end" width="33%">
                <ClearAndTrashIcons>
                    <Tooltip title="Clear Chat" placement="top">
                        <StyledIconButton
                            disableRipple
                            aria-label="clear_chat"
                            onClick={() =>
                                handleClearMessages(
                                    id,
                                    idToken,
                                    setMessages,
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
                </ClearAndTrashIcons>
            </Box>
        </Bar>
    );
};

export default ChatBar;
