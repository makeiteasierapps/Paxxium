import { useContext, useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import ChatSettings from './ChatSettings';
import { ChatContext } from '../../../contexts/ChatContext';

import {
    Bar,
    ClearAndTrashIcons,
    StyledIconButton,
} from '../chatStyledComponents';

const ChatBar = () => {
    const {
        clearChat,
        deleteChat,
        createChat,
        selectedChatId,
        getSelectedChat,
        isSettingsOpen,
        setIsSettingsOpen,
    } = useContext(ChatContext);
    const [deleteClicked, setDeleteClicked] = useState(false);
    const [agentModel, setAgentModel] = useState();
    const [systemMessage, setSystemMessage] = useState();
    const [useProfileData, setUseProfileData] = useState();
    const [chatName, setChatName] = useState();

    const theme = useTheme();
    useEffect(() => {
        if (selectedChatId) {
            const selectedChat = getSelectedChat(selectedChatId);
            setAgentModel(selectedChat.agent_model);
            setSystemMessage(selectedChat.system_message);
            setUseProfileData(selectedChat.use_profile_data);
            setChatName(selectedChat.chat_name);
        }
    }, [getSelectedChat, selectedChatId]);

    const handleSubmit = () => {
        createChat();
    };

    const handleDeleteClick = () => {
        if (deleteClicked) {
            deleteChat(selectedChatId);
        } else {
            setDeleteClicked(true);
            setTimeout(() => {
                setDeleteClicked(false);
            }, 3000);
        }
    };

    return (
        <Bar>
            {!isSettingsOpen && (
                <Box display="flex" justifyContent="flex-start">
                    <Typography variant="h6">{chatName}</Typography>
                </Box>
            )}
            {isSettingsOpen && (
                <ChatSettings
                    agentModel={agentModel}
                    setAgentModel={setAgentModel}
                    chatConstants={systemMessage}
                    setChatConstants={setSystemMessage}
                    chatName={chatName}
                    setChatName={setChatName}
                />
            )}
            <Box display="flex" justifyContent="flex-end">
                <ClearAndTrashIcons
                    sx={{ flexDirection: isSettingsOpen ? 'column' : 'row' }}
                >
                    <Tooltip
                        title={'Create New Chat'}
                        placement={isSettingsOpen ? 'left' : 'top'}
                    >
                        <StyledIconButton
                            id="createButton"
                            name="createButton"
                            onClick={handleSubmit}
                        >
                            <AddIcon />
                        </StyledIconButton>
                    </Tooltip>

                    <Tooltip
                        title="AI Insight"
                        placement={isSettingsOpen ? 'left' : 'top'}
                    >
                        <StyledIconButton
                            disableRipple
                            aria-label="AI Insight"
                            onClick={() => setUseProfileData(!useProfileData)}
                        >
                            <TipsAndUpdatesIcon
                                sx={{
                                    color: useProfileData
                                        ? theme.palette.text.secondary
                                        : 'inherit',
                                }}
                            />
                        </StyledIconButton>
                    </Tooltip>

                    <Tooltip
                        title="Settings"
                        placement={isSettingsOpen ? 'left' : 'top'}
                    >
                        <StyledIconButton
                            disableRipple
                            aria-label="settings"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            <SettingsIcon />
                        </StyledIconButton>
                    </Tooltip>
                    <Tooltip
                        title="Clear Chat"
                        placement={isSettingsOpen ? 'left' : 'top'}
                    >
                        <StyledIconButton
                            disableRipple
                            aria-label="clear_chat"
                            onClick={() => clearChat(selectedChatId)}
                        >
                            <CommentsDisabledIcon />
                        </StyledIconButton>
                    </Tooltip>
                    <Tooltip
                        title={deleteClicked ? 'Click again to confirm' : ''}
                        open={deleteClicked}
                        placement={isSettingsOpen ? 'left' : 'top'}
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
