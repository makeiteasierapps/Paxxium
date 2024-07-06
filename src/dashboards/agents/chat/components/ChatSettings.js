import {
    FormControlLabel,
    Menu,
    MenuItem,
    TextField,
    Grid,
    Typography,
    IconButton,
    Switch,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useContext, useState } from 'react';
import { ChatContext } from '../ChatContext';
import {
    SettingsMenuContainer,
    SettingsSubmitButton,
    SettingsMenuButton,
    InvisibleInput,
} from '../../agentStyledComponents';

const settingsMenuVariants = {
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.7 },
        transformOrigin: 'top right',
    },
    hidden: {
        scale: 0,
        opacity: 0,
        transition: { duration: 0.7 },
        transformOrigin: 'top right',
    },
};

const ChatSettings = ({
    chatId = '',
    setIsSettingsOpen = null,
    chatConstants: initialChatConstants = '',
    systemPrompt: initialSystemPrompt = '',
    chatName: initialChatName = '',
    agentModel: initialAgentModel = '',
    useProfileData: initialUseProfileData = false,
}) => {
    const { createChat, updateSettings, chatArray, loadChat } =
        useContext(ChatContext);

    const [agentModel, setAgentModel] = useState(initialAgentModel);
    const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
    const [chatConstants, setChatConstants] = useState(initialChatConstants);
    const [useProfileData, setUseProfileData] = useState(initialUseProfileData);

    const [chatName, setChatName] = useState(initialChatName);
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

    const [errors, setErrors] = useState({
        selectModel: '',
        name: '',
    });

    const handleLoadChat = async (chatId) => {
        loadChat(chatId);
        if (setIsSettingsOpen) {
            setIsSettingsOpen(false);
        }
    };

    const handleSubmit = () => {
        if (validate()) {
            createChat(
                agentModel,
                systemPrompt,
                chatConstants,
                useProfileData,
                chatName
            );
        }
    };

    const handleUpdateSettings = () => {
        const newAgentSettings = {
            chatId: chatId,
            agent_model: agentModel,
            system_prompt: systemPrompt,
            chat_constants: chatConstants,
            use_profile_data: useProfileData,
            chat_name: chatName,
        };
        updateSettings(newAgentSettings);
    };

    const validate = () => {
        let tempErrors = {};
        tempErrors.selectModel = agentModel ? '' : 'This field is required.';
        tempErrors.name = chatName ? '' : 'This field is required.';
        setErrors({
            ...tempErrors,
        });

        return Object.values(tempErrors).every((x) => x === '');
    };

    return (
        <SettingsMenuContainer
            id="settings-container"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={settingsMenuVariants}
        >
            <Grid container spacing={2} direction="column" padding={2}>
                <Grid
                    item
                    xs={12}
                    container
                    display="flex"
                    justifyContent={chatId ? 'space-between' : 'right'}
                    alignItems="center"
                >
                    {chatId && (
                        <IconButton
                            aria-label="close"
                            onClick={() => setIsSettingsOpen(false)}
                            sx={{ padding: 0 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                    <SettingsMenuButton
                        id="loadChat"
                        style={{ width: '15%' }}
                        onClick={handleClick('loadChat')}
                    >
                        Load
                    </SettingsMenuButton>
                    <Menu
                        anchorEl={anchorEl['loadChat']}
                        open={Boolean(anchorEl['loadChat'])}
                        onClose={handleClose('loadChat')}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        {chatArray.map((agent) => {
                            return (
                                <MenuItem
                                    key={agent.chatId}
                                    value={agent.chatId}
                                    onClick={() => {
                                        handleLoadChat(agent.chatId);
                                        handleClose('loadChat');
                                    }}
                                >
                                    {agent.chat_name}
                                </MenuItem>
                            );
                        })}
                    </Menu>
                </Grid>
                {/* Select Model */}
                <Grid
                    item
                    xs={12}
                    container
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
                >
                    <SettingsMenuButton
                        error={errors.selectModel ? true : false}
                        helperText={errors.selectModel}
                        required
                        id="model"
                        name="model"
                        sx={{ width: '28%' }}
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
                            value={'gpt-3.5'}
                            onClick={handleClose('model')}
                        >
                            GPT-3.5
                        </MenuItem>
                        <MenuItem
                            value={'gpt-4o'}
                            onClick={handleClose('model')}
                        >
                            GPT-4o
                        </MenuItem>
                        <MenuItem
                            value={'gpt-4-turbo'}
                            onClick={handleClose('model')}
                        >
                            GPT-4-turbo
                        </MenuItem>
                    </Menu>
                </Grid>
                {/* Chat Name */}
                <Grid
                    item
                    xs={12}
                    container
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
                >
                    <SettingsMenuButton
                        error={errors.selectModel ? true : false}
                        helperText={errors.selectModel}
                        required
                        id="name"
                        onClick={() => setIsEditing(true)}
                    >
                        {isEditing ? (
                            <InvisibleInput
                                autoFocus
                                value={chatName}
                                onChange={handleEdit}
                                onBlur={() => setIsEditing(false)}
                                onKeyDown={handleKeyPress}
                                fullWidth
                            />
                        ) : chatName ? (
                            chatName
                        ) : (
                            'Chat Name'
                        )}
                    </SettingsMenuButton>
                </Grid>

                <Grid item container spacing={2} xs={12}>
                    <Grid item xs={6}>
                        <Typography
                            variant="subtitle1"
                            color="textSecondary"
                            align="center"
                            fontWeight="bold"
                            fontFamily={'Titillium Web, sans-serif'}
                        >
                            Personality/Role
                        </Typography>

                        <TextField
                            id="systemPrompt"
                            name="systemPrompt"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={systemPrompt}
                            onChange={(event) =>
                                setSystemPrompt(event.target.value)
                            }
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            variant="subtitle1"
                            color="textSecondary"
                            align="center"
                            fontWeight="bold"
                            fontFamily={'Titillium Web, sans-serif'}
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
                        />
                    </Grid>
                </Grid>
                <Grid
                    item
                    xs={12}
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
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
                </Grid>

                <Grid item container spacing={2} xs={12}>
                    <Grid item xs={6}>
                        <SettingsSubmitButton
                            id="createButton"
                            name="createButton"
                            fullWidth
                            onClick={handleSubmit}
                        >
                            Create
                        </SettingsSubmitButton>
                    </Grid>
                    <Grid item xs={6}>
                        <SettingsSubmitButton
                            id="updateButton"
                            name="updateButton"
                            fullWidth
                            onClick={handleUpdateSettings}
                        >
                            Update
                        </SettingsSubmitButton>
                    </Grid>
                </Grid>
            </Grid>
        </SettingsMenuContainer>
    );
};

export default ChatSettings;
