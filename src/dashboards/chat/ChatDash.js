import { memo, useContext } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import MySnackbar from '../../SnackBar';
import Chat from './components/Chat';
import ChatSettings from './components/ChatSettings';
import { ChatContext } from '../../contexts/ChatContext';
import { Box } from '@mui/material';

import { CustomGridLoader } from '../main/customLoaders';

const ChatDash = () => {
    const { chatArray, loading } = useContext(ChatContext);
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);

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
                    {chatArray.filter((agent) => agent.is_open).length > 0 ? (
                        chatArray
                            .filter((agent) => agent.is_open)
                            .map((agent) => (
                                <Chat key={agent.chatId} agent={agent} />
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
        </Box>
    );
};

export default memo(ChatDash);
