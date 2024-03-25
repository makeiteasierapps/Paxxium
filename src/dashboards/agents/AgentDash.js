import { memo, useContext, useEffect, useState } from 'react';
import AgentSpeedDial from './AgentSpeedDial';
import { AuthContext } from '../../auth/AuthContext';
import { SnackbarContext } from '../../SnackbarContext';
import MySnackbar from '../../SnackBar';
import Chat from './chat/Chat';
import ChatSettings from './chat/components/ChatSettings';
import { ChatContext } from './chat/ChatContext';
import { Box, TextField, InputAdornment } from '@mui/material';
import { StyledIconButton } from './agentStyledComponents';
import SendIcon from '@mui/icons-material/Send';

import { CustomGridLoader } from '../main/customLoaders';

const WebScrapeTextField = () => {
    const { idToken } = useContext(AuthContext);
    const [url, setUrl] = useState('');
    const handleScrapeReuqest = async (url) => {
        const response = await fetch('http://localhost:50006/project/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) throw new Error('Failed to scrape url');

        setUrl('');

        // Handle response
    };

    return (
        <TextField
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <StyledIconButton
                            disabled={!url}
                            disableRipple
                            aria-label="scrape url"
                            onClick={() => {
                                handleScrapeReuqest(url);
                            }}
                        >
                            <SendIcon />
                        </StyledIconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};

const AgentDash = () => {
    const { getChats, agentArray } = useContext(ChatContext);
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);
    const { idToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [isScrapeOpen, setIsScrapeOpen] = useState(false);

    useEffect(() => {
        if (!idToken) return;
        getChats().then(() => {
            setLoading(false);
        });
    }, [idToken, getChats]);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                height: '100vh',
            }}
        >
            {loading ? (
                <Box marginTop={30}>
                    <CustomGridLoader />
                </Box>
            ) : (
                <>
                    {agentArray.filter((agent) => agent.is_open).length > 0 ? (
                        agentArray
                            .filter((agent) => agent.is_open)
                            .map((agent) => (
                                <Chat
                                    key={agent.chatId}
                                    chatId={agent.chatId}
                                    chatConstants={agent.chat_constants}
                                    systemPrompt={agent.system_prompt}
                                    chatName={agent.chat_name}
                                    agentModel={agent.agent_model}
                                    useProfileData={agent.use_profile_data}
                                />
                            ))
                    ) : (
                        <ChatSettings />
                    )}
                </>
            )}
            <MySnackbar
                open={snackbarInfo.open}
                message={snackbarInfo.message}
                severity={snackbarInfo.severity}
                handleClose={hideSnackbar}
            />
            <AgentSpeedDial setIsScrapeOpen={setIsScrapeOpen} />
            {isScrapeOpen && <WebScrapeTextField />}
        </Box>
    );
};

export default memo(AgentDash);
