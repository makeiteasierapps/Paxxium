import { memo, useRef, useCallback, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import UserMessage from './UserMessage';
import AgentMessage from './AgentMessage';
import { MessageArea } from '../chatStyledComponents';
import { Box } from '@mui/material';

const MessageList = ({
    messages,
    loadedAvatarImage,
    messageAreaRef,
    handleScroll,
}) => {
    const listRef = useRef(null);
    const sizeMap = useRef({});

    // Reset cached sizes when messages change
    const resetCache = useCallback(() => {
        if (listRef.current) {
            listRef.current.resetAfterIndex(0);
        }
    }, []);

    // More accurate size estimation based on content
    const getItemSize = (index) => {
        // Return cached size if available
        if (sizeMap.current[index]) {
            return sizeMap.current[index];
        }

        const message = messages[index];
        const contentLength =
            typeof message.content === 'string'
                ? message.content.length
                : JSON.stringify(message.content).length;

        // Base height + estimated content height
        // Adjust these values based on your UI
        const baseHeight = 80; // Avatar, padding, etc.
        const lineHeight = 24; // Approximate line height
        const charsPerLine = 80; // Approximate chars per line

        // Calculate estimated height
        const lines = Math.max(1, Math.ceil(contentLength / charsPerLine));
        const estimatedHeight = baseHeight + lines * lineHeight;

        // Cache the result
        sizeMap.current[index] = estimatedHeight;
        return estimatedHeight;
    };

    // Handle message rendering with size measurement
    const renderMessage = useCallback(
        ({ index, style }) => {
            const message = messages[index];
            const MessageComponent =
                message.message_from === 'user' ? UserMessage : AgentMessage;

            return (
                <div
                    style={{
                        ...style,
                        height: 'auto', // Allow content to determine height
                        top: style.top,
                        left: 0,
                        width: '100%',
                        position: 'absolute',
                    }}
                >
                    <MessageComponent
                        className="message-item"
                        message={message}
                        loadedAvatarImage={loadedAvatarImage}
                        onRender={(height) => {
                            // Update size cache if actual height differs
                            if (height && sizeMap.current[index] !== height) {
                                sizeMap.current[index] = height;
                                if (listRef.current) {
                                    listRef.current.resetAfterIndex(index);
                                }
                            }
                        }}
                    />
                </div>
            );
        },
        [loadedAvatarImage, messages]
    );

    // Reset cache when messages change
    useEffect(() => {
        sizeMap.current = {};
        resetCache();

        // Scroll to bottom when new messages arrive
        if (listRef.current && messages.length > 0) {
            listRef.current.scrollToItem(messages.length - 1);
        }
    }, [messages.length, resetCache]);

    return (
        <MessageArea
            ref={messageAreaRef}
            onScroll={handleScroll}
            sx={{
                height: '100%',
                overflow: 'hidden', // Let react-window handle scrolling
            }}
        >
            <Box sx={{ height: '100%', width: '100%' }}>
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                            ref={listRef}
                            height={height}
                            itemCount={messages.length}
                            itemSize={getItemSize}
                            width={width}
                            overscanCount={5} // Render more items to reduce blank spaces
                            initialScrollOffset={0}
                            style={{ overflowX: 'hidden' }}
                        >
                            {renderMessage}
                        </List>
                    )}
                </AutoSizer>
            </Box>
        </MessageArea>
    );
};

export default memo(MessageList);
