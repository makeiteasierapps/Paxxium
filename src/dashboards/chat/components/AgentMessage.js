import React, { useRef, useState, useEffect } from 'react';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import {
    MessageListItem,
    MessageContent,
    StyledMarkdown,
} from '../chatStyledComponents';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Box, CircularProgress } from '@mui/material';

// Direct code block component - most reliable option for code rendering
const DirectCodeBlock = ({ language, content }) => (
    <SyntaxHighlighter
        style={duotoneDark}
        language={language || 'javascript'}
        PreTag="div"
        className="syntax-highlighter"
        customStyle={{ maxHeight: '400px' }}
    >
        {content || ''}
    </SyntaxHighlighter>
);

// Basic code block renderer for markdown content
const CodeBlock = ({ language, children, inline, className }) => {
    const match = /language-(\w+)/.exec(className || '');

    if (!inline && (match || language)) {
        return (
            <SyntaxHighlighter
                style={duotoneDark}
                language={language || match?.[1]}
                PreTag="div"
                className="syntax-highlighter"
                customStyle={{ maxHeight: '400px' }}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        );
    }

    return <code className={className}>{children}</code>;
};

// Text content with markdown - simplified to improve performance
const MarkdownContent = ({ content }) => (
    <StyledMarkdown
        components={{ code: CodeBlock }}
        remarkPlugins={[remarkGfm]}
    >
        {content || ''}
    </StyledMarkdown>
);

// Main agent message component with forceful update system
const AgentMessage = ({ message }) => {
    const messageRef = useRef(null);
    // This will be refreshed on every render to force content display
    const [counter, setCounter] = useState(0);
    const messageContent = message.content;

    // Important: Force a re-render whenever the content changes
    useEffect(() => {
        // Schedule multiple updates to ensure token visibility
        const id1 = setTimeout(() => setCounter((c) => c + 1), 0);
        const id2 = setTimeout(() => setCounter((c) => c + 1), 50);
        return () => {
            clearTimeout(id1);
            clearTimeout(id2);
        };
    }, [messageContent]);

    // Render message content with defensive programming
    const renderContent = () => {
        if (!messageContent) {
            return <CircularProgress size={20} />;
        }

        // Array format (streamed content)
        if (Array.isArray(messageContent)) {
            return messageContent.map((item, index) => {
                // Generate a unique key for each content item that changes on each update
                const key = `${item.type}-${index}-${counter}`;

                if (item.type === 'text') {
                    return (
                        <Box key={key} className="text-content">
                            <MarkdownContent content={item.content} />
                        </Box>
                    );
                } else if (item.type === 'code') {
                    return (
                        <Box key={key} className="code-content">
                            <DirectCodeBlock
                                language={item.language || 'javascript'}
                                content={item.content}
                            />
                        </Box>
                    );
                }
                return null;
            });
        }

        // String format (database content)
        if (typeof messageContent === 'string') {
            return (
                <Box key={`string-${counter}`}>
                    <MarkdownContent content={messageContent} />
                </Box>
            );
        }

        return null;
    };

    return (
        <MessageListItem ref={messageRef} messageFrom={message.message_from}>
            <Box>{renderContent()}</Box>
        </MessageListItem>
    );
};

export default AgentMessage;
