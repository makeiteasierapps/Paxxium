import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { Box } from '@mui/material';
import { MessageContainer, MessageContent } from '../../agentStyledComponents';
import Theme from '../../../../Theme';



const AgentMessage = ({ message }) => {
    const theme = useTheme(Theme);
    return (
        <MessageContainer messageFrom={message.message_from}>
            <Icon
                icon="mdi:robot"
                style={{
                    fontSize: '36px',
                    position: 'relative',
                    marginRight: '13px',
                    color: theme.palette.text.secondary,
                }}
            />

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
