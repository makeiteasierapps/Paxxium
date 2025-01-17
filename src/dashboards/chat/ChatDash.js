import { memo, useContext } from 'react';
import Chat from './components/Chat';
import ChatBar from './components/ChatBar';
import { ChatContext } from '../../contexts/ChatContext';
import { Box, Typography } from '@mui/material';
import { MainContainer } from '../styledComponents/DashStyledComponents';

import { CustomGridLoader } from '../main/customLoaders';

const ChatDash = () => {
    const { loading, selectedChatId, messages } = useContext(ChatContext);

    return (
        <MainContainer id="chat-dash-main-container">
            {loading ? (
                <Box marginTop={30}>
                    <CustomGridLoader />
                </Box>
            ) : selectedChatId ? (
                <>
                    <ChatBar />
                    <Chat messages={messages[selectedChatId]} />
                </>
            ) : (
                <Box>
                    <Typography>No chat selected</Typography>
                </Box>
            )}
        </MainContainer>
    );
};

export default memo(ChatDash);
