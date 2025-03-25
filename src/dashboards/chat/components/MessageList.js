import { memo, useRef, useEffect } from 'react';
import UserMessage from './UserMessage';
import AgentMessage from './AgentMessage';
import { MessageArea } from '../chatStyledComponents';
import { Box } from '@mui/material';

const MessageList = ({ messages, loadedAvatarImage }) => {
  const listRef = useRef(null);

  // Scroll to the bottom automatically when new messages arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <MessageArea sx={{ height: '100%', overflow: 'hidden' }}>
      <Box
        ref={listRef}
        sx={{
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message, index) => {
          const MessageComponent =
            message.message_from === 'user' ? UserMessage : AgentMessage;
          return (
            <div key={index} style={{ width: '100%' }}>
              <MessageComponent message={message} loadedAvatarImage={loadedAvatarImage} />
            </div>
          );
        })}
        </Box>
    </MessageArea>
  );
};

export default memo(MessageList);
