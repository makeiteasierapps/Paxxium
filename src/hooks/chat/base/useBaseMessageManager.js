import { useCallback, useRef } from 'react';
import { processIncomingStream } from '../../../dashboards/utils/processIncomingStream';
import { useFileUpload } from '../useFileUpload';

export const useBaseMessageManager = ({
    baseUrl,
    uid,
    showSnackbar,
    setChatArray,
    selectedChat,
    updateLocalSettings,
    storageKey,
}) => {
    const { uploadFile } = useFileUpload();
    const streamDestinationId = useRef(null);
    const updateChatMessagesList = useCallback(
        (chatId, newMessages, isOptimistic = false) => {
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
                        storageKey,
                        JSON.stringify(sortedChatArray)
                    );
                }

                return sortedChatArray;
            });
        },
        [setChatArray, storageKey]
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

                // Update local storage with the updated agent array
                localStorage.setItem(
                    storageKey,
                    JSON.stringify(updatedChatArray)
                );

                return updatedChatArray;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const handleStreamingResponse = useCallback(
        async (data) => {
            console.log(data);
            streamDestinationId.current = data.room;
            const currentChatThread = selectedChat?.messages || [];

            if (data.type === 'end_of_stream') {
                // For end of stream, update immediately
                const lastUserMessageIndex = currentChatThread
                    .map((m) => m.message_from)
                    .lastIndexOf('user');

                if (lastUserMessageIndex !== -1) {
                    const updatedThread = [...currentChatThread];
                    updatedThread[lastUserMessageIndex] = {
                        ...updatedThread[lastUserMessageIndex],
                        image_path: data.image_path,
                    };

                    updateChatMessagesList(
                        streamDestinationId.current,
                        updatedThread
                    );
                }
            } else {
                // Process token and update immediately
                const updatedThread = processIncomingStream(
                    currentChatThread,
                    data
                );

                // Update without throttling
                updateChatMessagesList(
                    streamDestinationId.current,
                    updatedThread
                );
            }
        },
        [updateChatMessagesList, selectedChat]
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
