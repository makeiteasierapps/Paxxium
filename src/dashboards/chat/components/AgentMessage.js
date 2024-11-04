import { Icon } from '@iconify/react';
import { ListItem } from '@mui/material';
import { MessageContent, StyledMarkdown } from '../chatStyledComponents';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@mui/material/styles';

const AgentMessage = ({ message, className }) => {
    const theme = useTheme();
    const components = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <SyntaxHighlighter
                    style={duotoneDark}
                    language={match[1]}
                    PreTag="div"
                    className="syntax-highlighter"
                    children={String(children).replace(/\n$/, '')}
                    {...props}
                />
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
    };

    return (
        <ListItem className={className} messageFrom={message.message_from}>
            <Icon
                icon="mdi:robot"
                style={{
                    fontSize: '36px',
                    position: 'relative',
                    marginRight: '13px',
                    color: theme.palette.primary.dark,
                }}
            />

            <MessageContent>
                {Array.isArray(message.content)
                    ? message.content.map((msg, index) => {
                          if (msg.type === 'text') {
                              return (
                                  <StyledMarkdown
                                      key={`text${index}`}
                                      components={components}
                                      remarkPlugins={[remarkGfm]}
                                  >
                                      {msg.content.replace(/\n\s*\n/g, ' \n')}
                                  </StyledMarkdown>
                              );
                          } else if (msg.type === 'code') {
                              return (
                                  <SyntaxHighlighter
                                      key={`code${index}`}
                                      language={msg.language}
                                      style={duotoneDark}
                                  >
                                      {msg.content}
                                  </SyntaxHighlighter>
                              );
                          }
                          return null;
                      })
                    : null}
            </MessageContent>
        </ListItem>
    );
};

export default AgentMessage;
