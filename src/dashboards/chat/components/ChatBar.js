import { useContext, useState } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import ChatSettings from './ChatSettings';
import { ChatContext } from '../../../contexts/ChatContext';
import { SystemContext } from '../../../contexts/SystemContext';
import {
    Bar,
    ClearAndTrashIcons,
    StyledIconButton,
} from '../chatStyledComponents';

const ChatBar = ({ type, sx }) => {
    const userContext = useContext(ChatContext);
    const systemContext = useContext(SystemContext);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [deleteClicked, setDeleteClicked] = useState(false);
    const context = type === 'user' ? userContext : systemContext;
    const selectedChat =
        type === 'user' ? context.selectedChat : context.selectedSystemChat;

    const updateSelectedChat =
        type === 'user'
            ? context.updateSelectedChat
            : context.updateLocalSettings;

    const { clearChat, deleteChat, createChat } = context;

    const theme = useTheme();

    const handleSubmit = () => {
        createChat();
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
        <Bar sx={sx}>
            {isSettingsOpen && (
                <ChatSettings
                    type={type}
                    updateSelectedChat={updateSelectedChat}
                    selectedChat={selectedChat}
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
                            onClick={() =>
                                updateSelectedChat({
                                    use_profile_data:
                                        !selectedChat?.use_profile_data,
                                })
                            }
                        >
                            <TipsAndUpdatesIcon
                                sx={{
                                    color: selectedChat?.use_profile_data
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
                            onClick={() => clearChat(selectedChat.chatId)}
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
