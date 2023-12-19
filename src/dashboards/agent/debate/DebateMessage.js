import { Avatar } from '@mui/material';
import { blueGrey, green, red } from '@mui/material/colors';
import { MessageContent, MessageContainer } from '../agentStyledComponents';

const DebateMessage = ({ message, agent }) => {
    return (
        <MessageContainer
            sx={{
                backgroundColor:
                    agent === 'agent1' ? blueGrey[800] : blueGrey[700],
            }}
        >
            <Avatar
                variant="square"
                sx={{
                    width: '33px',
                    height: '33px',
                    bgcolor: agent === 'agent1' ? green[500] : red[500],
                    color: blueGrey[700],
                    marginRight: '13px',
                }}
            />

            <MessageContent>
                {message.map((msg, index) => {
                    if (msg.type === 'text') {
                        return msg.content;
                    } else if (msg.type === 'code') {
                        return (
                            <pre
                                key={`code${index}`}
                                className={`language-${msg.language}`}
                            >
                                <code
                                    dangerouslySetInnerHTML={{
                                        __html: msg.content,
                                    }}
                                />
                            </pre>
                        );
                    }
                    return null;
                })}
            </MessageContent>
        </MessageContainer>
    );
};

export default DebateMessage;
