import React, { useRef, useState, useEffect } from 'react';
import { MessageListItem, StyledMarkdown } from '../chatStyledComponents';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

// Direct code block component - with copy button properly overlaid
const DirectCodeBlock = ({ language, content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                <IconButton
                    onClick={handleCopy}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        backgroundColor: 'rgba(30, 30, 30, 0.6)',
                        '&:hover': {
                            backgroundColor: 'rgba(60, 60, 60, 0.8)',
                            color: 'white',
                        },
                        zIndex: 2,
                        padding: '4px',
                    }}
                >
                    {copied ? (
                        <CheckIcon fontSize="small" />
                    ) : (
                        <ContentCopyIcon fontSize="small" />
                    )}
                </IconButton>
            </Tooltip>
            <SyntaxHighlighter
                style={duotoneDark}
                language={language || 'javascript'}
                PreTag="div"
                className="syntax-highlighter"
                customStyle={{ maxHeight: 'none' }} // Removed the paddingTop
            >
                {content || ''}
            </SyntaxHighlighter>
        </Box>
    );
};

// Basic code block renderer for markdown content - with copy button properly overlaid
const CodeBlock = ({ language, children, inline, className }) => {
    const match = /language-(\w+)/.exec(className || '');
    const [copied, setCopied] = useState(false);
    const codeContent = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!inline && (match || language)) {
        return (
            <Box sx={{ position: 'relative' }}>
                <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                    <IconButton
                        onClick={handleCopy}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            backgroundColor: 'rgba(30, 30, 30, 0.6)',
                            '&:hover': {
                                backgroundColor: 'rgba(60, 60, 60, 0.8)',
                                color: 'white',
                            },
                            zIndex: 2,
                            padding: '4px',
                        }}
                    >
                        {copied ? (
                            <CheckIcon fontSize="small" />
                        ) : (
                            <ContentCopyIcon fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>
                <SyntaxHighlighter
                    style={duotoneDark}
                    language={language || match?.[1]}
                    PreTag="div"
                    className="syntax-highlighter"
                    customStyle={{ maxHeight: 'none' }} // Removed the paddingTop
                >
                    {codeContent}
                </SyntaxHighlighter>
            </Box>
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
                        <Box
                            key={key}
                            className="text-content"
                            sx={{ width: '100%' }}
                        >
                            <MarkdownContent content={item.content} />
                        </Box>
                    );
                } else if (item.type === 'code') {
                    return (
                        <Box
                            key={key}
                            className="code-content"
                            sx={{
                                width: '100%',
                                backgroundColor: 'red',
                            }}
                        >
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
                <Box key={`string-${counter}`} sx={{ width: '100%' }}>
                    <MarkdownContent content={messageContent} />
                </Box>
            );
        }

        return null;
    };

    return (
        <MessageListItem
            ref={messageRef}
            messageFrom={message.message_from}
            sx={{ height: 'auto', maxHeight: 'none' }}
        >
            <Box sx={{ width: '100%' }}>{renderContent()}</Box>
        </MessageListItem>
    );
};

export default AgentMessage;
