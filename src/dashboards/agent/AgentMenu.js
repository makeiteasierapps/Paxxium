import { Grid, MenuItem, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import { ChatContext } from '../../dashboards/agent/chat/ChatContext';
import ChatSettings from './chat/components/ChatSettings';

const AgentMenu = () => {
    const { agentArray, loadChat } = useContext(ChatContext);
    const [selectedAgentId, setSelectedAgentId] = useState('');

    const handleLoadChat = async (event) => {
        const chatId = event.target.value;
        setSelectedAgentId(chatId);
        loadChat(chatId);
    };

    return (
        <Grid container spacing={2}>
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
            <ChatSettings />
        </Grid>
    );
};

export default AgentMenu;
