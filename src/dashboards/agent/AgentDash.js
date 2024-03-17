import { memo, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { SnackbarContext } from '../../SnackbarContext';
import MySnackbar from '../../SnackBar';
import AgentMenu from './AgentMenu';
import Chat from './chat/Chat';
import { ChatContext } from './chat/ChatContext';
import { Box } from '@mui/material';

import {
    Settings,
    SettingsMenuButton,
    SettingsMenuContainer,
} from './agentStyledComponents';

import { CustomGridLoader } from '../main/customLoaders';

const AgentDash = () => {
    const { setSelectedAgent, getChats, agentArray } = useContext(ChatContext);
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);
    const { idToken } = useContext(AuthContext);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!idToken) return;
        const data = getChats();

        if (data.length > 0) {
            const openAgents = data.filter((agent) => agent.is_open === true);

            // Set settings open if no open agents are found
            setSettingsOpen(openAgents.length === 0);

            // Set the selected agent to the first open agent
            const chatAgent = openAgents[0];
            if (chatAgent) setSelectedAgent(chatAgent);
        }

        setLoading(false);
    }, [idToken, setSelectedAgent, getChats]);

    useEffect(() => {});

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                height: '100vh',
            }}
        >
            {settingsOpen && (
                <SettingsMenuContainer id="settings-container">
                    <Settings id="settings">
                        <AgentMenu />
                    </Settings>
                </SettingsMenuContainer>
            )}
            <SettingsMenuButton
                disableRipple
                onClick={() => setSettingsOpen(!settingsOpen)}
            >
                {settingsOpen ? 'Hide' : 'Settings'}
            </SettingsMenuButton>
            {loading ? (
                <Box marginTop={30}>
                    <CustomGridLoader />
                </Box>
            ) : (
                <>
                    {agentArray
                        .filter((agent) => agent.is_open)
                        .map((agent) => {
                            return (
                                <Chat
                                    key={agent.chatId}
                                    chatId={agent.chatId}
                                    chatConstants={agent.chat_constants}
                                    systemPrompt={agent.system_prompt}
                                    chatName={agent.chat_name}
                                    agentModel={agent.agent_model}
                                    useProfileData={agent.use_profile_data}
                                />
                            );
                        })}
                </>
            )}
            <MySnackbar
                open={snackbarInfo.open}
                message={snackbarInfo.message}
                severity={snackbarInfo.severity}
                handleClose={hideSnackbar}
            />
        </Box>
    );
};

export default memo(AgentDash);
