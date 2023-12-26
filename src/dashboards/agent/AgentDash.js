import { memo, useContext, useEffect, useState } from 'react';
import { AuthContext, backendUrl } from '../../auth/AuthContext';
import AgentMenu from './AgentMenu';
import Chat from './chat/Chat';
import { ChatContext } from './chat/ChatContext';
import Debate from './debate/Debate';
import { Box } from '@mui/material';

import {
    Settings,
    SettingsMenuButton,
    SettingsMenuContainer,
} from './agentStyledComponents';

import { CustomGridLoader } from '../main/customLoaders';

const AgentDash = () => {
    const { setSelectedAgent, agentArray, setAgentArray } =
        useContext(ChatContext);
    const { idToken } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!idToken) return;
        const getChatData = async () => {
            try {
                const response = await fetch(`${backendUrl}/chat`, {
                    method: 'GET',
                    headers: {
                        Authorization: idToken,
                    },
                    credentials: 'include',
                });

                if (!response.ok)
                    throw new Error('Failed to load user conversations');

                const data = await response.json();
                // data is an array of objects
                setAgentArray(data);
                if (data.length > 0) {
                    const openAgents = data.filter(
                        (agent) =>
                            agent.is_open === true &&
                            agent.agent_model !== 'AgentDebate'
                    );
                    if (openAgents.length === 0) {
                        setSettingsOpen(true);
                    }
                }

                if (data.length > 0) {
                    const chatAgent = data.find(
                        (agent) =>
                            agent.is_open === true &&
                            agent.agent_model !== 'AgentDebate'
                    );
                    if (chatAgent) setSelectedAgent(chatAgent);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setError(error.message);
            }
        };

        getChatData();
    }, [idToken, setAgentArray, setSelectedAgent, setError]);

    if (error) {
        return <Box>Error: {error}</Box>;
    }

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
                            if (agent.agent_model === 'AgentDebate') {
                                return (
                                    <Debate
                                        key={agent.id}
                                        id={agent.id}
                                        chatName={agent.chat_name}
                                        topic={agent.topic}
                                    />
                                );
                            } else {
                                return (
                                    <Chat
                                        key={agent.id}
                                        id={agent.id}
                                        chatConstants={agent.chat_constants}
                                        systemPrompt={agent.system_prompt}
                                        chatName={agent.chat_name}
                                        agentModel={agent.agent_model}
                                        useProfileData={agent.use_profile_data}
                                    />
                                );
                            }
                        })}
                </>
            )}
        </Box>
    );
};

export default memo(AgentDash);
