import { useCallback, useEffect, useRef } from 'react';
import { processIncomingStream } from '../../dashboards/utils/processIncomingStream';

import { useImageProcessing } from './useImageProcessing';

export const useMessageManager = (
    backendUrl,
    uid,
    showSnackbar,
    setChatArray,
    setMessages,
    messages,
    socket
) => {
    const selectedChatId = useRef(null);

    const imageManager = useImageProcessing();

    // Used to add a new user message to the messages state
    const addMessage = (chatId, newMessage) => {
        setMessages((prevMessageParts) => {
            const updatedMessages = {
                ...prevMessageParts,
                [chatId]: [...(prevMessageParts[chatId] || []), newMessage],
            };

            // Update chatArray with the new message
            setChatArray((preyChatArray) => {
                const updatedChatArray = preyChatArray.map((agent) => {
                    if (agent.chatId === chatId) {
                        return {
                            ...agent,
                            messages: updatedMessages[chatId],
                        };
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

            return updatedMessages;
        });
    };

    // Used to get the messages for a specific chat
    // Sent in as chat history
    const getMessages = (chatId) => {
        return messages[chatId] || [];
    };

    const sendMessage = async (input, chatSettings, image = null) => {
        let imageUrl = null;
        if (image) {
            try {
                const resizedImageBlob =
                    await imageManager.resizeAndConvertImageToBlob(
                        image,
                        400,
                        400
                    );
                imageUrl = await imageManager.uploadImageAndGetUrl(
                    resizedImageBlob
                );
            } catch (error) {
                console.error(error);
                showSnackbar(
                    `Image processing or upload error: ${error.message}`,
                    'error'
                );
                return;
            }
        }

        // Optimistic update
        const userMessage = {
            content: input,
            message_from: 'user',
            time_stamp: new Date().toISOString(),
            type: 'database',
            image_url: imageUrl,
        };
        addMessage(chatSettings.chatId, userMessage);

        const chatHistory = await getMessages(chatSettings.chatId);

        if (socket.current) {
            socket.current.emit('chat_request', {
                userId: uid,
                chatId: chatSettings.chatId,
                dbName: 'paxxium',
                imageUrl: imageUrl,
                chatSettings: chatSettings,
                chatHistory: chatHistory,
                userMessage: userMessage,
                saveToDb: true,
                createVectorPipeline: false,
            });
        }
    };

    const clearChat = async (chatId) => {
        try {
            const response = await fetch(`${backendUrl}/messages`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
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

    const handleStreamingResponse = useCallback(async (data) => {
        selectedChatId.current = data.room;
        if (data.type === 'end_of_stream') {
            console.log('end of stream');
        } else {
            let newMessageParts;
            setMessages((prevMessages) => {
                newMessageParts = processIncomingStream(
                    prevMessages,
                    selectedChatId.current,
                    data
                );

                // Update chatArray state to reflect the new messages
                setChatArray((prevChatArray) => {
                    const updatedChatArray = prevChatArray.map((chat) => {
                        if (chat.chatId === selectedChatId.current) {
                            return {
                                ...chat,
                                messages:
                                    newMessageParts[selectedChatId.current], // Ensure messages is an array
                            };
                        }
                        return chat;
                    });

                    // Save updated chatArray to local storage
                    localStorage.setItem(
                        'chatArray',
                        JSON.stringify(updatedChatArray)
                    );

                    return updatedChatArray;
                });
                return newMessageParts;
            });
        }
    }, []);

    useEffect(() => {
        if (!socket.current) return;

        socket.current.on('chat_response', handleStreamingResponse);

        return () => {
            if (socket.current) {
                socket.current.off('chat_response', handleStreamingResponse);
            }
        };
    }, [handleStreamingResponse]);

    return {
        addMessage,
        getMessages,
        sendMessage,
        clearChat,
        handleStreamingResponse,
    };
};
