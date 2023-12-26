import { Icon } from '@iconify/react';
import { Avatar, Box } from '@mui/material';
import { MessageContainer, MessageContent } from '../../agentStyledComponents';

const AgentMessage = ({ message }) => {
    return (
        <MessageContainer>
            <Avatar
                sx={{
                    bgcolor: 'secondary.main',
                    width: '33px',
                    height: '33px',
                    marginRight: '13px',
                }}
            >
                <Icon
                    icon="mdi:robot"
                    style={{
                        fontSize: '29px',
                        position: 'relative',
                        top: '-1px',
                    }}
                />
            </Avatar>

            <MessageContent>
                {message.map((msg, index) => {
                    if (msg.type === 'text') {
                        return <Box key={`text${index}`}>{msg.content}</Box>;
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

export default AgentMessage;
