import React, { memo } from 'react';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import {
    MessageListItem,
    MessageContent,
    StyledMarkdown,
    StyledAgentIcon,
} from '../chatStyledComponents';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const AgentMessage = ({ message }) => {
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
        <MessageListItem messageFrom={message.message_from}>
            <StyledAgentIcon>
                <SmartToyOutlinedIcon />
            </StyledAgentIcon>

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
        </MessageListItem>
    );
};

export default memo(AgentMessage);
