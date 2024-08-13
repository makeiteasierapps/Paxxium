import { memo, useContext } from 'react';
import Chat from './components/Chat';
import { ChatContext } from '../../contexts/ChatContext';
import { Box, Typography } from '@mui/material';
import { MainContainer } from '../styledComponents/DashStyledComponents';

import { CustomGridLoader } from '../main/customLoaders';

const ChatDash = () => {
    const { loading, selectedChat } = useContext(ChatContext);

    return (
        <MainContainer id="chat-dash-main-container">
            {loading ? (
                <Box marginTop={30}>
                    <CustomGridLoader />
                </Box>
            ) : selectedChat ? (
                <Chat agent={selectedChat} />
            ) : (
                <Box>
                    <Typography>No chat selected</Typography>
                </Box>
            )}
        </MainContainer>
    );
};

export default memo(ChatDash);
