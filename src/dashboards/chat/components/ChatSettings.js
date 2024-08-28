import {
    FormControlLabel,
    Menu,
    MenuItem,
    TextField,
    Box,
    Typography,
    Switch,
} from '@mui/material';

import { useContext, useState } from 'react';
import { ChatContext } from '../../../contexts/ChatContext';
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

    const handleClose = (menu) => () => {
        setAnchorEl((prevState) => ({ ...prevState, [menu]: null }));
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
                    <Menu
                        id="model-menu"
                        anchorEl={anchorEl['model']}
                        open={Boolean(anchorEl['model'])}
                        onClose={handleClose('model')}
                        onClick={(event) => {
                            const value = event.target.getAttribute('value');
                            if (value) {
                                setAgentModel(value);
                                handleUpdateSettings({ agent_model: value });
                            }
                        }}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem
                            value={'gpt-4o-mini'}
                            onClick={handleClose('model')}
                        >
                            GPT-4o-mini
                        </MenuItem>
                        <MenuItem
                            value={'gpt-4o'}
                            onClick={handleClose('model')}
                        >
                            GPT-4o
                        </MenuItem>
                        <MenuItem
                            value={'claude-3-5-sonnet-20240620'}
                            onClick={handleClose('model')}
                        >
                            Claude 3.5 Sonnet
                        </MenuItem>
                    </Menu>

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

                <Box width="100%" marginBottom={2}>
                    <Typography
                        variant="subtitle1"
                        color="textSecondary"
                        align="center"
                        fontWeight="bold"
                        fontFamily={'Titillium Web, sans-serif'}
                        marginBottom={1}
                    >
                        Things to Remember
                    </Typography>

                    <TextField
                        id="chatConstants"
                        name="chatConstants"
                        multiline
                        rows={4}
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
                                    checked={selectedChat.use_profile_data}
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
