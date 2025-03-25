import { memo, useRef, useEffect, useState, useCallback } from 'react';
import UserMessage from './UserMessage';
import AgentMessage from './AgentMessage';
import { MessageArea } from '../chatStyledComponents';
import { Box, Button, Fade } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FixedSizeList as VirtualList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// Higher threshold for virtualization to ensure streaming works well
const VIRTUALIZATION_THRESHOLD = 50;

// Detect if we're off screen (within this many pixels)
const SCROLL_THRESHOLD = 150;

// Interval to check content height during streaming (ms)
const CHECK_CONTENT_INTERVAL = 200;

// Row renderer for virtualized list
const MessageRow = ({ data, index, style }) => {
    const { messages, loadedAvatarImage } = data;
    const message = messages[index];
    const MessageComponent =
        message.message_from === 'user' ? UserMessage : AgentMessage;

    return (
        <Box
            style={{
                ...style,
                width: '100%',
                paddingLeft: 16,
                paddingRight: 16,
            }}
        >
            <MessageComponent
                message={message}
                loadedAvatarImage={loadedAvatarImage}
            />
        </Box>
    );
};

const MessageList = ({
    messages,
    loadedAvatarImage,
    selectedChatId,
    id = 'message-list-container',
}) => {
    const listRef = useRef(null);
    const virtualListRef = useRef(null);

    // State to track button visibility and streaming state
    const [showMoreButton, setShowMoreButton] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    // Track content for detecting streaming
    const lastContentLengthRef = useRef(0);
    const contentTimerRef = useRef(null);
    const checkHeightIntervalRef = useRef(null);

    // Track scroll position and chat state
    const lastChatId = useRef(selectedChatId);
    const lastMsgCount = useRef(messages.length);
    const scrollingRef = useRef(false);

    // Only use virtualization for longer conversations
    const useVirtualization = messages.length > VIRTUALIZATION_THRESHOLD;

    // Calculate the total content length (for detecting streaming)
    const calculateContentLength = useCallback(() => {
        return messages.reduce((total, msg) => {
            if (Array.isArray(msg.content)) {
                return (
                    total +
                    msg.content.reduce(
                        (sum, item) => sum + (item.content?.length || 0),
                        0
                    )
                );
            }
            return (
                total +
                (typeof msg.content === 'string' ? msg.content.length : 0)
            );
        }, 0);
    }, [messages]);

    // Check if content is overflowing (streaming beyond the visible area)
    const checkContentOverflow = useCallback(() => {
        if (!isStreaming || !listRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        // Show button when content is streaming beyond visible area
        setShowMoreButton(distanceFromBottom > SCROLL_THRESHOLD);
    }, [isStreaming]);

    // Show more content - Improved to move bottom content to top of view
    const handleShowMore = useCallback(() => {
        scrollingRef.current = true;

        if (useVirtualization && virtualListRef.current) {
            // For virtualized lists, calculate a smart scroll position
            // that moves current bottom content to the top of the view
            const listInfo = virtualListRef.current._outerRef;
            const currentScrollOffset =
                virtualListRef.current.state.scrollOffset;
            const visibleHeight = listInfo.clientHeight;

            // Scroll to position that puts bottom content at top of view
            // This reveals an entire new viewportful of content
            const newScrollPosition = currentScrollOffset + visibleHeight - 50; // 50px overlap for context
            virtualListRef.current.scrollTo(newScrollPosition);
        } else if (listRef.current) {
            // For regular lists, move current bottom content to top of view
            const container = listRef.current;
            const { scrollTop, clientHeight } = container;

            // Calculate new position: current position + visible height - small overlap for context
            const newScrollPosition = scrollTop + clientHeight - 50; // 50px overlap for context

            container.scrollTo({
                top: newScrollPosition,
                behavior: 'smooth',
            });
        }

        // Reset scrolling state after animation completes
        setTimeout(() => {
            scrollingRef.current = false;
            checkContentOverflow();
        }, 300);
    }, [useVirtualization, checkContentOverflow]);

    // Start monitoring for content overflow when streaming begins
    useEffect(() => {
        if (isStreaming) {
            // Clear any existing interval
            if (checkHeightIntervalRef.current) {
                clearInterval(checkHeightIntervalRef.current);
            }

            // Set an interval to check content height during streaming
            checkHeightIntervalRef.current = setInterval(() => {
                checkContentOverflow();
            }, CHECK_CONTENT_INTERVAL);

            // Do an immediate check
            checkContentOverflow();
        } else {
            // Clear interval when streaming stops
            if (checkHeightIntervalRef.current) {
                clearInterval(checkHeightIntervalRef.current);
                checkHeightIntervalRef.current = null;
            }

            // Hide button when streaming ends
            setShowMoreButton(false);
        }

        return () => {
            if (checkHeightIntervalRef.current) {
                clearInterval(checkHeightIntervalRef.current);
                checkHeightIntervalRef.current = null;
            }
        };
    }, [isStreaming, checkContentOverflow]);

    // Detect streaming by monitoring content length changes
    useEffect(() => {
        const currentContentLength = calculateContentLength();

        // Content is growing - we're streaming
        if (currentContentLength > lastContentLengthRef.current) {
            setIsStreaming(true);

            // Clear any existing timeout
            if (contentTimerRef.current) {
                clearTimeout(contentTimerRef.current);
            }

            // Set timeout to detect end of streaming
            contentTimerRef.current = setTimeout(() => {
                setIsStreaming(false);
                setShowMoreButton(false);
            }, 1000); // Assume streaming ended if no new content for 1 second
        }

        // Update reference to current content length
        lastContentLengthRef.current = currentContentLength;

        return () => {
            if (contentTimerRef.current) {
                clearTimeout(contentTimerRef.current);
            }
        };
    }, [messages, calculateContentLength]);

    // Scroll to bottom when switching chats
    useEffect(() => {
        if (selectedChatId !== lastChatId.current) {
            lastChatId.current = selectedChatId;
            lastMsgCount.current = messages.length;
            lastContentLengthRef.current = calculateContentLength();
            setIsStreaming(false);

            // Scroll to bottom of new chat
            setTimeout(() => {
                if (useVirtualization && virtualListRef.current) {
                    virtualListRef.current.scrollToItem(messages.length - 1);
                } else if (listRef.current) {
                    listRef.current.scrollTop = listRef.current.scrollHeight;
                }
                setShowMoreButton(false);
            }, 50);
        }
    }, [
        selectedChatId,
        messages.length,
        useVirtualization,
        calculateContentLength,
    ]);

    // Initial scroll to bottom
    useEffect(() => {
        // Scroll to bottom on initial render
        setTimeout(() => {
            if (useVirtualization && virtualListRef.current) {
                virtualListRef.current.scrollToItem(messages.length - 1);
            } else if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
            }
        }, 100);

        // Add window resize handler
        const handleResize = () => {
            if (useVirtualization && virtualListRef.current) {
                virtualListRef.current.scrollToItem(messages.length - 1);
            } else if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
            }

            // Check for overflow after resize
            if (isStreaming) {
                checkContentOverflow();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [messages.length, useVirtualization, isStreaming, checkContentOverflow]);

    // Scroll to bottom for new messages
    useEffect(() => {
        if (messages.length > lastMsgCount.current) {
            lastMsgCount.current = messages.length;
            lastContentLengthRef.current = calculateContentLength();
            setIsStreaming(true);

            // For brand new messages, always scroll to bottom
            setTimeout(() => {
                if (useVirtualization && virtualListRef.current) {
                    virtualListRef.current.scrollToItem(messages.length - 1);
                } else if (listRef.current) {
                    listRef.current.scrollTop = listRef.current.scrollHeight;
                }
            }, 50);

            // Reset streaming detection timer
            if (contentTimerRef.current) {
                clearTimeout(contentTimerRef.current);
            }

            contentTimerRef.current = setTimeout(() => {
                setIsStreaming(false);
                setShowMoreButton(false);
            }, 1000);
        }
    }, [messages.length, useVirtualization, calculateContentLength]);

    // Render the show more button
    const renderShowMoreButton = () => (
        <Fade in={showMoreButton}>
            <Box
                sx={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 20,
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                }}
            >
                <Button
                    variant="text"
                    color="primary"
                    size="small"
                    onClick={handleShowMore}
                    startIcon={<ExpandMoreIcon />}
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: 20,
                        boxShadow: 1,
                        px: 2,
                        py: 0.5,
                        fontWeight: 400,
                        fontSize: '0.8rem',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        },
                    }}
                >
                    Show more
                </Button>
            </Box>
        </Fade>
    );

    // Regular scroll view for smaller message lists
    const renderRegularList = () => (
        <Box position="relative" height="100%">
            <Box
                id={id}
                ref={listRef}
                sx={{
                    height: '100%',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                key={`${selectedChatId}-msgs-${messages.length}`}
            >
                {messages.map((message, index) => {
                    const MessageComponent =
                        message.message_from === 'user'
                            ? UserMessage
                            : AgentMessage;
                    return (
                        <Box
                            key={`${selectedChatId}-msg-${index}`}
                            width="100%"
                        >
                            <MessageComponent
                                message={message}
                                loadedAvatarImage={loadedAvatarImage}
                            />
                        </Box>
                    );
                })}
            </Box>
            {renderShowMoreButton()}
        </Box>
    );

    // Virtualized list for performance with many messages
    const renderVirtualizedList = () => (
        <Box position="relative" height="100%" id={id}>
            <AutoSizer>
                {({ height, width }) => (
                    <VirtualList
                        ref={virtualListRef}
                        height={height}
                        width={width}
                        itemCount={messages.length}
                        itemSize={100}
                        itemData={{ messages, loadedAvatarImage }}
                        overscanCount={5}
                        key={`${selectedChatId}-virt-${messages.length}`}
                    >
                        {MessageRow}
                    </VirtualList>
                )}
            </AutoSizer>
            {renderShowMoreButton()}
        </Box>
    );

    return (
        <MessageArea sx={{ height: '100%', overflow: 'hidden' }}>
            {useVirtualization ? renderVirtualizedList() : renderRegularList()}
        </MessageArea>
    );
};

export default MessageList;
