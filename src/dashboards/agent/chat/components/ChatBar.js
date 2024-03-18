import { useContext, useState } from 'react';
import { Typography, Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import { ChatContext } from '../ChatContext';

import {
    Bar,
    ClearAndTrashIcons,
    StyledIconButton,
    CloseIconButton,
} from '../../agentStyledComponents';

const ChatBar = ({ chatName, chatId, isVisible, setIsVisible }) => {
    const { closeChat, clearChat, deleteChat } = useContext(ChatContext);
    const [deleteClicked, setDeleteClicked] = useState(false);

    const handleDeleteClick = () => {
        if (deleteClicked) {
            deleteChat(chatId);
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
                    onClick={() => closeChat(chatId)}
                >
                    <CloseIcon sx={{ fontSize: '1.1rem' }} />
                </CloseIconButton>
            </Box>
            <Box display="flex" justifyContent="center" width="33%">
                <Typography variant="h6">{chatName}</Typography>
            </Box>
            <Box display="flex" justifyContent="flex-end" width="33%">
                <ClearAndTrashIcons>
                    <Tooltip title={'Settings'} placement="top">
                        <StyledIconButton
                            disableRipple
                            aria-label="settings"
                            onClick={() => setIsVisible(!isVisible)}
                        >
                            <SettingsIcon />
                        </StyledIconButton>
                    </Tooltip>
                    <Tooltip title="Clear Chat" placement="top">
                        <StyledIconButton
                            disableRipple
                            aria-label="clear_chat"
                            onClick={() => clearChat(chatId)}
                        >
                            <CommentsDisabledIcon />
                        </StyledIconButton>
                    </Tooltip>
                    <Tooltip
                        title={deleteClicked ? 'Click again to confirm' : ''}
                        open={deleteClicked}
                        placement="top"
                    >
                        <StyledIconButton
                            disableRipple
                            aria-label="delete"
                            onClick={handleDeleteClick}
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
