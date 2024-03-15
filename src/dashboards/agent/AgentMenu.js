import { Grid, MenuItem, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import { ChatContext } from '../../dashboards/agent/chat/ChatContext';
import DebateSettings from '../agent/debate/DebateSettings';
import ChatSettings from './chat/components/ChatSettings';

const AgentMenu = () => {
    const { agentArray, loadChat } = useContext(ChatContext);
    const [selectedAgent, setSelectedAgent] = useState('Chat');
    const [selectedAgentId, setSelectedAgentId] = useState('');

    const handleLoadChat = async (event) => {
        const chatId = event.target.value;
        setSelectedAgentId(chatId);
        loadChat(chatId);
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
                            <MenuItem key={agent.chatId} value={agent.chatId}>
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
