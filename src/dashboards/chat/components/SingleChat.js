import { memo } from 'react';
import Chat from './Chat';

const SingleChat = ({ chat, sx, type }) => {
    return (
        <Chat
            selectedChat={chat}
            chatArray={[chat]}
            setSelectedChatId={() => {}}
            sx={sx}
            type={type}
        />
    );
};

export default memo(SingleChat);
