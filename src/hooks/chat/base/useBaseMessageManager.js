import { useCallback, useRef, useState } from 'react';
import { processIncomingStream } from '../../../dashboards/utils/processIncomingStream';
import { useFileUpload } from '../useFileUpload';

export const useBaseMessageManager = ({
    baseUrl,
    uid,
    showSnackbar,
    setChatArray,
    selectedChat,
    updateLocalSettings,
}) => {
    const { uploadFile } = useFileUpload();
    const streamDestinationId = useRef(null);

    // Use direct state access instead of refs for token processing
    const updateChatMessagesList = useCallback(
        (chatId, newMessages, isOptimistic = false) => {
            // Use a functional update to ensure we're working with the latest state
            setChatArray((prevChatArray) => {
                // Apply updates to a fresh copy
                const updatedChatArray = prevChatArray.map((chat) => {
                    if (chat.chatId === chatId) {
                        return {
                            ...chat,
                            messages: newMessages,
                            updated_at: new Date().toISOString(),
                        };
                    }
                    return chat;
                });

                const sortedChatArray = updatedChatArray.sort(
                    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
                );

                return sortedChatArray;
            });
        },
        [setChatArray]
    );

    const addMessage = useCallback(
        (chatId, newMessage, isOptimistic = false) => {
            const updatedMessages = [
                ...(selectedChat.messages || []),
                newMessage,
            ];
            updateChatMessagesList(chatId, updatedMessages, isOptimistic);
            return updatedMessages;
        },
        [selectedChat, updateChatMessagesList]
    );

    const handleImageUpload = async (imageContextItems) => {
        const newContext = [...(selectedChat.context || [])];
        const images = imageContextItems.map((item) => item.image);
        const uploadedImages = await uploadFile(images);

        const updatedContext = newContext.map((contextItem) => {
            const imageItem = imageContextItems.find(
                (item) => item.name === contextItem.name
            );
            if (imageItem) {
                const imageIndex = imageContextItems.indexOf(imageItem);
                return {
                    type: 'image',
                    name: contextItem.name,
                    image_path: uploadedImages[imageIndex].storedPath,
                    image: undefined,
                };
            }
            return contextItem;
        });

        // Return the updated context
        await updateLocalSettings({
            chatId: selectedChat.chatId,
            uid: selectedChat.uid,
            context: updatedContext,
        });
        return updatedContext;
    };

    const baseSendMessage = async (input) => {
        let currentChat = { ...selectedChat };

        if (selectedChat.context?.length) {
            const imageContextItems = selectedChat.context.filter(
                (item) => item.type === 'image' && item.image
            );

            if (imageContextItems.length) {
                const updatedContext = await handleImageUpload(
                    imageContextItems
                );
                currentChat = { ...currentChat, context: updatedContext };
            }
        }

        const userMessage = {
            content: input,
            message_from: 'user',
            created_at: new Date().toISOString(),
            type: 'database',
        };

        const updatedMessages = addMessage(
            currentChat.chatId,
            userMessage,
            true
        );

        return {
            currentChat,
            updatedMessages,
        };
    };

    const clearChat = async (chatId) => {
        try {
            const response = await fetch(`${baseUrl}/messages`, {
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

                return updatedChatArray;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    // Direct streaming handler - explicitly retrieve the latest state for each token
    const handleStreamingResponse = useCallback(
        (data) => {
            // Set destination chat ID
            streamDestinationId.current = data.room;

            // Force a state update to ensure the token is processed
            setChatArray((prevChatArray) => {
                // Find the current chat
                const currentChat = prevChatArray.find(
                    (chat) => chat.chatId === streamDestinationId.current
                );

                if (!currentChat) {
                    console.warn(
                        'Chat not found:',
                        streamDestinationId.current
                    );
                    return prevChatArray;
                }

                // Get the current messages
                const currentMessages = currentChat.messages || [];

                // Process the token
                let updatedMessages;

                if (data.type === 'end_of_stream') {
                    // For end of stream, update correctly
                    const lastUserMessageIndex = currentMessages
                        .map((m) => m.message_from)
                        .lastIndexOf('user');

                    if (lastUserMessageIndex !== -1) {
                        // Create a deep copy
                        updatedMessages = JSON.parse(
                            JSON.stringify(currentMessages)
                        );
                        updatedMessages[lastUserMessageIndex] = {
                            ...updatedMessages[lastUserMessageIndex],
                            image_path: data.image_path,
                        };
                    } else {
                        updatedMessages = currentMessages;
                    }
                } else {
                    // Process the token and create updated messages
                    updatedMessages = processIncomingStream(
                        currentMessages,
                        data
                    );
                }

                // Create the updated chat array
                const updatedChatArray = prevChatArray.map((chat) => {
                    if (chat.chatId === streamDestinationId.current) {
                        return {
                            ...chat,
                            messages: updatedMessages,
                            updated_at: new Date().toISOString(),
                        };
                    }
                    return chat;
                });

                // Sort chats by updated_at
                const sortedChatArray = updatedChatArray.sort(
                    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
                );

                return sortedChatArray;
            });
        },
        [setChatArray]
    );

    const handleChatSettingsUpdated = useCallback(
        (data) => {
            console.log('chat settings updated', data);
            updateLocalSettings({ chatId: data.chat_id, ...data });
        },
        [updateLocalSettings]
    );

    return {
        addMessage,
        baseSendMessage,
        clearChat,
        updateChatMessagesList,
        handleStreamingResponse,
        handleChatSettingsUpdated,
    };
};
