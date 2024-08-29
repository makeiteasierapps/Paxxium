import {
    FormControlLabel,
    TextField,
    Box,
    Typography,
    Switch,
} from '@mui/material';

import { useContext, useState } from 'react';
import { ChatContext } from '../../../contexts/ChatContext';
import ModelMenu from './ModelMenu';
import {
    SettingsMenuContainer,
    SettingsMenuButton,
    InvisibleInput,
} from '../chatStyledComponents';

const ChatSettings = ({
    setChatName,
    chatName,
    setAgentModel,
    agentModel,
    setChatConstants,
    chatConstants,
    setUseProfileData,
    useProfileData,
}) => {
    const { selectedChat, updateSettings } = useContext(ChatContext);

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


    const handleUpdateSettings = (newSettings) => {
        updateSettings({
            chatId: selectedChat.chatId,
            ...newSettings,
        });
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
                    <TextField
                        id="chatConstants"
                        name="chatConstants"
                        multiline
                        rows={2}
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
                    />
                </Box>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                >
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        marginBottom={2}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    color="secondary"
                                    name="useProfileData"
                                    checked={useProfileData}
                                    onChange={(event) =>
                                        setUseProfileData(event.target.checked)
                                    }
                                    size="large"
                                />
                            }
                            label={
                                <Typography
                                    color="secondary"
                                    fontWeight="bold"
                                    fontFamily={'Titillium Web, sans-serif'}
                                >
                                    AI Insight
                                </Typography>
                            }
                        />
                    </Box>
                </Box>
            </Box>
        </SettingsMenuContainer>
    );
};

export default ChatSettings;
