import { useCallback, useEffect, useRef, useContext } from 'react';
import { processIncomingStream } from '../../dashboards/utils/processIncomingStream';
import { KbContext } from '../../contexts/KbContext';
export const useMessageManager = ({
    backendUrl,
    uid,
    showSnackbar,
    getSelectedChat,
    setChatArray,
    setMessages,
    chatArray,
    messages,
    socket,
    validateMentions,
}) => {
    const streamDestinationId = useRef(null);
    const { kbArray } = useContext(KbContext);

    const updateChatArrayAndMessages = useCallback(
        (chatId, newMessages, isOptimistic = false) => {
            setMessages((prevMessages) => ({
                ...prevMessages,
                [chatId]: newMessages,
            }));

            setChatArray((prevChatArray) => {
                const updatedChatArray = prevChatArray.map((chat) =>
                    chat.chatId === chatId
                        ? {
                              ...chat,
                              messages: newMessages,
                              updated_at: new Date().toISOString(),
                          }
                        : chat
                );

                const sortedChatArray = updatedChatArray.sort(
                    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
                );

                if (!isOptimistic) {
                    localStorage.setItem(
                        'chatArray',
                        JSON.stringify(sortedChatArray)
                    );
                }

                return sortedChatArray;
            });
        },
        [setChatArray, setMessages]
    );

    const addMessage = useCallback(
        (chatId, newMessage, isOptimistic = false) => {
            return new Promise((resolve) => {
                setMessages((prevMessages) => {
                    const updatedMessages = [
                        ...(prevMessages[chatId] || []),
                        newMessage,
                    ];
                    updateChatArrayAndMessages(
                        chatId,
                        updatedMessages,
                        isOptimistic
                    );
                    resolve(updatedMessages);
                    return {
                        ...prevMessages,
                        [chatId]: updatedMessages,
                    };
                });
            });
        },
        [setMessages, updateChatArrayAndMessages]
    );

    // Used to get the messages for a specific chat
    // Sent in as chat history
    const getMessages = (chatId) => {
        return messages[chatId] || [];
    };

    const sendMessage = async (input, image = null) => {
        let kbIds = [];
        let imageBlob = null;

        if (kbArray.length > 0) {
            // Validate all mentions in the message
            const mentions = validateMentions(input);

            // Get all valid mentions and their corresponding KB IDs
            const validMentions = mentions.filter((m) => m.isValid);
            kbIds = validMentions
                .map((mention) => {
                    console.log(mention);
                    const kb = kbArray.find(
                        (kb) => kb.name === mention.mention
                    );
                    return kb?.id;
                })
                .filter((id) => id != null);
        }

        if (image) {
            try {
                imageBlob = image;
            } catch (error) {
                console.error(error);
                showSnackbar(
                    `Image processing error: ${error.message}`,
                    'error'
                );
                return;
            }
        }

        const userMessage = {
            content: input,
            message_from: 'user',
            created_at: new Date().toISOString(),
            type: 'database',
            image_path: imageBlob,
        };

        const selectedChat = getSelectedChat();
        const updatedMessages = await addMessage(
            selectedChat.chatId,
            userMessage,
            true
        );
        const chatWithUpdatedMessages = {
            ...selectedChat,
            messages: updatedMessages,
        };
        try {
            if (socket) {
                socket.emit('chat', {
                    imageBlob,
                    fileName: imageBlob ? imageBlob.name : null,
                    selectedChat: chatWithUpdatedMessages,
                    kbIds,
                });
            }
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const clearChat = async (chatId) => {
        try {
            const response = await fetch(`${backendUrl}/messages`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
                },
                body: JSON.stringify({ chatId }),
            });

            if (!response.ok) throw new Error('Failed to clear messages');

            // Update the chatArray state
            setChatArray((prevChatArray) => {
                const updatedChatArray = prevChatArray.map((agent) => {
                    if (agent.chatId === chatId) {
                        // Clear messages for the matching chat
                        return { ...agent, messages: [] };
                    }
                    return agent;
                });

                // Update local storage with the updated agent array
                localStorage.setItem(
                    'chatArray',
                    JSON.stringify(updatedChatArray)
                );

                return updatedChatArray;
            });

            // Update the messages state for the UI to reflect the cleared messages
            setMessages((prevMessages) => {
                const updatedMessages = { ...prevMessages, [chatId]: [] };
                // No need to update 'messages' in local storage since it's part of 'chatArray'
                return updatedMessages;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const handleContextUrls = useCallback(
        (data) => {
            setChatArray((prevChatArray) =>
                prevChatArray.map((chat) =>
                    chat.chatId === streamDestinationId.current
                        ? { ...chat, context_urls: data }
                        : chat
                )
            );
        },
        [setChatArray] // Updated dependency array
    );

    const handleStreamingResponse = useCallback(
        async (data) => {
            streamDestinationId.current = data.room;
            const currentChatThread =
                messages[streamDestinationId.current] || [];

            if (data.type === 'end_of_stream') {
                const lastUserMessageIndex = currentChatThread
                    .map((m) => m.message_from)
                    .lastIndexOf('user');

                if (lastUserMessageIndex !== -1) {
                    const updatedThread = [...currentChatThread];
                    updatedThread[lastUserMessageIndex] = {
                        ...updatedThread[lastUserMessageIndex],
                        image_path: data.image_path,
                    };

                    updateChatArrayAndMessages(
                        streamDestinationId.current,
                        updatedThread
                    );
                }
            } else {
                const updatedThread = processIncomingStream(
                    currentChatThread,
                    data
                );
                updateChatArrayAndMessages(
                    streamDestinationId.current,
                    updatedThread
                );
            }
        },
        [updateChatArrayAndMessages, messages]
    );

    useEffect(() => {
        if (!socket) return;

        const currentSocket = socket;
        currentSocket.on('chat_response', handleStreamingResponse);
        currentSocket.on('context_urls', handleContextUrls);
        return () => {
            currentSocket.off('chat_response', handleStreamingResponse);
            currentSocket.off('context_urls', handleContextUrls);
        };
    }, [handleContextUrls, handleStreamingResponse, socket]);

    return {
        addMessage,
        getMessages,
        sendMessage,
        clearChat,
    };
};
