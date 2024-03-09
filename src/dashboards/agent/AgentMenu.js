import { Grid, MenuItem, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { ChatContext } from '../../dashboards/agent/chat/ChatContext';
import DebateSettings from '../agent/debate/DebateSettings';
import ChatSettings from './chat/components/ChatSettings';

const AgentMenu = () => {
    const { idToken } = useContext(AuthContext);
    const { agentArray, setAgentArray } = useContext(ChatContext);
    const [selectedAgent, setSelectedAgent] = useState('Chat');
    const [selectedAgentId, setSelectedAgentId] = useState('');

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? process.env.REACT_APP_CHAT_URL
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const handleLoadChat = async (event) => {
        const selectedId = event.target.value;
        setSelectedAgentId(selectedId);

        // This is done so that the chat visibility persists even after the page is refreshed
        try {
            const response = await fetch(
                `${backendUrl}/chat/update_visibility`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: idToken,
                    },
                    body: JSON.stringify({ id: selectedId, is_open: true }),
                }
            );

            if (!response.ok) throw new Error('Failed to update chat');

            // Update the local state only after the database has been updated successfully
            setAgentArray((prevAgents) => {
                // Find the agent and update it
                const updatedAgent = prevAgents.find(
                    (agent) => agent.id === selectedId
                );
                if (updatedAgent) {
                    updatedAgent.is_open = true;
                }

                // Filter out the updated agent from the original array
                const filteredAgents = prevAgents.filter(
                    (agent) => agent.id !== selectedId
                );

                // Add the updated agent to the beginning of the array
                return updatedAgent
                    ? [updatedAgent, ...filteredAgents]
                    : filteredAgents;
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
                <TextField
                    required
                    select
                    id="selectAgent"
                    name="selectAgent"
                    label="Select Agent"
                    fullWidth
                    variant="standard"
                    value={selectedAgent}
                    onChange={(event) => setSelectedAgent(event.target.value)}
                >
                    <MenuItem value="Chat">Chat</MenuItem>
                    <MenuItem value="Debate">Debate</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} sm={9}>
                <TextField
                    select
                    id="loadChat"
                    name="loadChat"
                    label="Load Chat"
                    fullWidth
                    variant="standard"
                    value={selectedAgentId}
                    onChange={handleLoadChat}
                >
                    {agentArray.map((agent) => {
                        return (
                            <MenuItem key={agent.id} value={agent.id}>
                                {agent.chat_name}
                            </MenuItem>
                        );
                    })}
                </TextField>
            </Grid>
            {selectedAgent === 'Chat' ? <ChatSettings /> : <DebateSettings />}
        </Grid>
    );
};

export default AgentMenu;
