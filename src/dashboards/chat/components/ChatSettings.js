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

const ChatSettings = ({ updateSelectedChat, selectedChat }) => {
    const { updateSettings } = useContext(ChatContext);
    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = (event) => {
        if (isEditing) {
            updateSelectedChat({
                chat_name: event.target.value,
            });
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
                        {selectedChat?.agent_model
                            ? selectedChat.agent_model
                            : 'Select Model'}
                    </SettingsMenuButton>
                    <ModelMenu
                        anchorEl={anchorEl}
                        setAnchorEl={setAnchorEl}
                        updateSelectedChat={updateSelectedChat}
                        handleUpdateSettings={updateSettings}
                    />
                    <SettingsMenuButton
                        id="name"
                        onClick={() => setIsEditing(true)}
                        sx={{ width: '48%' }}
                    >
                        {isEditing ? (
                            <InvisibleInput
                                autoFocus
                                value={selectedChat?.chat_name}
                                onChange={handleEdit}
                                onBlur={() => {
                                    setIsEditing(false);
                                    updateSettings({
                                        chat_name: selectedChat.chat_name,
                                    });
                                }}
                                onKeyDown={handleKeyPress}
                                fullWidth
                            />
                        ) : selectedChat?.chat_name ? (
                            selectedChat.chat_name
                        ) : (
                            'Chat Name'
                        )}
                    </SettingsMenuButton>
                </Box>

                <Box width="100%" marginBottom={1}>
                    <ResizableTextField
                        id="systemMessage"
                        name="systemMessage"
                        multiline
                        fullWidth
                        variant="outlined"
                        value={selectedChat?.system_message}
                        onChange={(event) =>
                            updateSelectedChat({
                                system_message: event.target.value,
                            })
                        }
                        onBlur={() =>
                            updateSettings({
                                system_message: selectedChat.system_message,
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
