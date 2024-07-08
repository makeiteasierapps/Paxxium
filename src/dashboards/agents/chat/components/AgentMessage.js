import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { Box } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { twilight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { MessageContainer, MessageContent } from '../../agentStyledComponents';
import Theme from '../../../../Theme';

const AgentMessage = ({ message }) => {
    const theme = useTheme(Theme);

    const components = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <SyntaxHighlighter
                    style={twilight}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
    };

    return (
        <MessageContainer messageFrom="agent">
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
                {Array.isArray(message.content)
                    ? message.content.map((msg, index) => {
                          if (msg.type === 'text') {
                              return (
                                  <Box key={`text${index}`}>
                                      <ReactMarkdown components={components}>
                                          {msg.content}
                                      </ReactMarkdown>
                                  </Box>
                              );
                          } else if (msg.type === 'code') {
                              return (
                                  <SyntaxHighlighter
                                      key={`code${index}`}
                                      language={msg.language}
                                      style={twilight}
                                  >
                                      {msg.content}
                                  </SyntaxHighlighter>
                              );
                          }
                          return null;
                      })
                    : null}
            </MessageContent>
        </MessageContainer>
    );
};

export default AgentMessage;
