import { memo, useContext } from 'react';
import Chat from './components/Chat';
import ChatBar from './components/ChatBar';
import { ChatContext } from '../../contexts/ChatContext';
import { Box, Typography } from '@mui/material';
import { MainContainer } from '../styledComponents/DashStyledComponents';
import { CustomGridLoader } from '../main/customLoaders';
import { ContextManagerProvider } from '../../contexts/ContextManagerContext';
const ChatDash = () => {
    const { loading, selectedChat } = useContext(ChatContext);

    return (
        <ContextManagerProvider type="user">
            <MainContainer id="chat-dash-main-container">
                {loading ? (
                    <Box marginTop={30}>
                        <CustomGridLoader />
                    </Box>
                ) : selectedChat ? (
                    <>
                        <ChatBar />
                        <Chat messages={selectedChat.messages} />
                    </>
                ) : (
                    <Box>
                        <Typography>No chat selected</Typography>
                    </Box>
                )}
            </MainContainer>
        </ContextManagerProvider>
    );
};

export default memo(ChatDash);
