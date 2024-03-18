import { memo, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { SnackbarContext } from '../../SnackbarContext';
import MySnackbar from '../../SnackBar';
import Chat from './chat/Chat';
import { ChatContext } from './chat/ChatContext';
import { Box } from '@mui/material';


import { CustomGridLoader } from '../main/customLoaders';

const AgentDash = () => {
    const { getChats, agentArray } = useContext(ChatContext);
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);
    const { idToken } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);

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
