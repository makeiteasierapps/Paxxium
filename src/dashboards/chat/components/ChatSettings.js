import { TextField, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useContext, useState } from 'react';
import { ChatContext } from '../../../contexts/ChatContext';
import ModelMenu from './ModelMenu';
import {
    SettingsMenuContainer,
    SettingsMenuButton,
    InvisibleInput,
} from '../chatStyledComponents';

const ResizableTextField = styled(TextField)({
    '& .MuiInputBase-root': {
        height: '50px',
        padding: '3px 10px',
        overflow: 'hidden',
        resize: 'vertical',
    },
    '& .MuiInputBase-input': {
        height: '100% !important',
        overflow: 'auto !important',
        resize: 'none', // Disable resize on the inner input
    },
});

const ChatSettings = ({
    setChatName,
    chatName,
    setAgentModel,
    agentModel,
    setChatConstants,
    chatConstants,
}) => {
    const { selectedChatId, handleUpdateSettings, getSelectedChat } = useContext(ChatContext);

    const selectedChat = getSelectedChat(selectedChatId);

    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = (event) => {
        if (isEditing) {
            setChatName(event.target.value);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            setIsEditing(false);
        }
    };

    const [anchorEl, setAnchorEl] = useState({});

    const handleClick = (menu) => (event) => {
        setAnchorEl((prevState) => ({
            ...prevState,
            [menu]: event.currentTarget,
        }));
    };

    return (
        <SettingsMenuContainer id="settings-container">
            <Box display="flex" flexDirection="column" width="100%" padding={2}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                    marginBottom={2}
                >
                    <SettingsMenuButton
                        id="model"
                        name="model"
                        sx={{ width: '48%' }}
                        onClick={handleClick('model')}
                    >
                        {agentModel ? agentModel : 'Select Model'}
                    </SettingsMenuButton>
                    <ModelMenu
                        anchorEl={anchorEl}
                        setAnchorEl={setAnchorEl}
                        setAgentModel={setAgentModel}
                        handleUpdateSettings={handleUpdateSettings}
                    />

                    {/* Chat Name */}
                    <SettingsMenuButton
                        id="name"
                        onClick={() => setIsEditing(true)}
                        sx={{ width: '48%' }}
                    >
                        {isEditing ? (
                            <InvisibleInput
                                autoFocus
                                value={chatName}
                                onChange={handleEdit}
                                onBlur={() => {
                                    setIsEditing(false);
                                    handleUpdateSettings({
                                        chat_name: chatName,
                                    });
                                }}
                                onKeyDown={handleKeyPress}
                                fullWidth
                            />
                        ) : selectedChat.chat_name ? (
                            selectedChat.chat_name
                        ) : (
                            'Chat Name'
                        )}
                    </SettingsMenuButton>
                </Box>

                <Box width="100%" marginBottom={1}>
                    <ResizableTextField
                        id="chatConstants"
                        name="chatConstants"
                        multiline
                        fullWidth
                        variant="outlined"
                        value={chatConstants}
                        onChange={(event) =>
                            setChatConstants(event.target.value)
                        }
                        onBlur={() =>
                            handleUpdateSettings({
                                chat_constants: chatConstants,
                            })
                        }
                        InputProps={{
                            style: { resize: 'vertical' },
                        }}
                    />
                </Box>
            </Box>
        </SettingsMenuContainer>
    );
};

export default ChatSettings;
