import { Icon } from '@iconify/react';
import {
    MessageContainer,
    MessageContent,
    StyledMarkdown,
} from '../chatStyledComponents';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { twilight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const AgentMessage = ({ message }) => {
    const components = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <SyntaxHighlighter
                    style={twilight}
                    language={match[1]}
                    PreTag="div"
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
        <MessageContainer messageFrom={message.message_from}>
            <Icon
                icon="mdi:robot"
                style={{
                    fontSize: '36px',
                    position: 'relative',
                    marginRight: '13px',
                    color: 'gray',
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
                                      {msg.content}
                                  </StyledMarkdown>
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
