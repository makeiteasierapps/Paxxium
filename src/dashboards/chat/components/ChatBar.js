import { useContext, useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import ChatSettings from './ChatSettings';
import { ChatContext } from '../../../contexts/ChatContext';

import {
    Bar,
    ClearAndTrashIcons,
    StyledIconButton,
} from '../chatStyledComponents';

const ChatBar = ({ isSettingsOpen, setIsSettingsOpen }) => {
    const { clearChat, deleteChat, createChat, selectedChat } =
        useContext(ChatContext);
    const [deleteClicked, setDeleteClicked] = useState(false);
    const [agentModel, setAgentModel] = useState();
    const [chatConstants, setChatConstants] = useState();
    const [useProfileData, setUseProfileData] = useState();
    const [chatName, setChatName] = useState();

    useEffect(() => {
        if (selectedChat) {
            console.log('selectedChat', selectedChat);
            setAgentModel(selectedChat.agent_model);
            setChatConstants(selectedChat.chat_constants);
            setUseProfileData(selectedChat.use_profile_data);
            setChatName(selectedChat.chat_name);
        }
    }, [selectedChat]);

    const handleSubmit = () => {
        createChat('gpt-4o-mini', '', false, 'New Chat');
    };

    

    const handleDeleteClick = () => {
        if (deleteClicked) {
            deleteChat(selectedChat.chatId);
        } else {
            setDeleteClicked(true);
            setTimeout(() => {
                setDeleteClicked(false);
            }, 3000);
        }
    };

    return (
        <Bar>
            <Box display="flex" justifyContent="flex-start">
                <Typography variant="h6">{selectedChat.chat_name}</Typography>
            </Box>
            <ChatSettings
                agentModel={agentModel}
                setAgentModel={setAgentModel}
                chatConstants={chatConstants}
                setChatConstants={setChatConstants}
                useProfileData={useProfileData}
                setUseProfileData={setUseProfileData}
                chatName={chatName}
                setChatName={setChatName}
            />
            <Box display="flex" justifyContent="flex-end">
                <ClearAndTrashIcons>
                    <Tooltip title={'Create New Chat'} placement="top">
                        <StyledIconButton
                            id="createButton"
                            name="createButton"
                            onClick={handleSubmit}
                        >
                            <AddIcon />
                        </StyledIconButton>
                    </Tooltip>

                    <Tooltip title={'Settings'} placement="top">
                        <StyledIconButton
                            disableRipple
                            aria-label="settings"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            <SettingsIcon />
                        </StyledIconButton>
                    </Tooltip>
                    <Tooltip title="Clear Chat" placement="top">
                        <StyledIconButton
                            disableRipple
                            aria-label="clear_chat"
                            onClick={() => clearChat(selectedChat.chatId)}
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
