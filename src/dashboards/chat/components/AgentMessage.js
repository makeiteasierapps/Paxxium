import React, { memo, useRef, useEffect, useMemo } from 'react';
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

// Memoized code block component
const CodeBlock = memo(({ language, children, inline, className }) => {
    const match = /language-(\w+)/.exec(className || '');

    if (!inline && (match || language)) {
        return (
            <SyntaxHighlighter
                style={duotoneDark}
                language={language || match?.[1]}
                PreTag="div"
                className="syntax-highlighter"
                customStyle={{ maxHeight: '400px' }} // Limit height for very long code blocks
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        );
    }

    return <code className={className}>{children}</code>;
});

const AgentMessage = ({ message, onRender }) => {
    const messageRef = useRef(null);

    // Memoize the markdown components to prevent re-creation on each render
    const components = useMemo(
        () => ({
            code: CodeBlock,
        }),
        []
    );

    return (
        <MessageListItem ref={messageRef} messageFrom={message.message_from}>
            <StyledAgentIcon>
                <SmartToyOutlinedIcon />
            </StyledAgentIcon>

            <MessageContent>
                {Array.isArray(message.content) ? (
                    message.content.map((msg, index) => {
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
                                <CodeBlock
                                    key={`code${index}`}
                                    language={msg.language}
                                >
                                    {msg.content}
                                </CodeBlock>
                            );
                        }
                        return null;
                    })
                ) : typeof message.content === 'string' ? (
                    <StyledMarkdown
                        components={components}
                        remarkPlugins={[remarkGfm]}
                    >
                        {message.content}
                    </StyledMarkdown>
                ) : null}
            </MessageContent>
        </MessageListItem>
    );
};

export default AgentMessage;
