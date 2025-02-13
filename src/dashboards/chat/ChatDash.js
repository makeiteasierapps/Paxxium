import { memo, useContext } from 'react';
import Chat from './components/Chat';
import { ChatContext } from '../../contexts/ChatContext';
import { Box, Typography } from '@mui/material';
import { MainContainer } from '../styledComponents/DashStyledComponents';
import { CustomGridLoader } from '../main/customLoaders';
import { ContextManagerProvider } from '../../contexts/ContextManagerContext';
const ChatDash = () => {
    const { loading, selectedChat, chatArray, setSelectedChatId } = useContext(ChatContext);

    return (
        <ContextManagerProvider type="user">
            <MainContainer id="chat-dash-main-container">
                {loading ? (
                    <Box marginTop={30}>
                        <CustomGridLoader />
                    </Box>
                ) : selectedChat ? (
                    <>
                        <Chat selectedChat={selectedChat} chatArray={chatArray} setSelectedChatId={setSelectedChatId} type="user" />
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
