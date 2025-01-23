import { useCallback, useEffect, useRef } from 'react';
import { processIncomingStream } from '../../dashboards/utils/processIncomingStream';
import { useFileUpload } from './useFileUpload';
export const useMessageManager = ({
    backendUrl,
    uid,
    showSnackbar,
    setChatArray,
    setMessages,
    messages,
    socket,
    selectedChat,
    updateLocalSettings,
}) => {
    const { uploadFile } = useFileUpload();
    const streamDestinationId = useRef(null);
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

    const handleFileUpload = async (fileContextItems) => {
        const newContext = [...(selectedChat.context || [])];
        const files = fileContextItems.map((item) => item.file);
        const uploadedFiles = await uploadFile(files);

        const updatedContext = newContext.map((contextItem) => {
            const fileItem = fileContextItems.find(
                (item) => item.name === contextItem.name
            );
            if (fileItem) {
                const fileIndex = fileContextItems.indexOf(fileItem);
                return {
                    type: 'file',
                    name: contextItem.name,
                    file_path: uploadedFiles[fileIndex].storedPath,
                    file: undefined,
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

    const sendMessage = async (input) => {
        let currentChat = { ...selectedChat }; // Create local copy

        // Handle file uploads first if there are any files in context
        if (selectedChat.context?.length) {
            const fileContextItems = selectedChat.context.filter(
                (item) => item.type === 'file' && item.file
            );

            // Upload all files and get updated context
            if (fileContextItems.length) {
                const updatedContext = await handleFileUpload(fileContextItems);
                currentChat = { ...currentChat, context: updatedContext };
            }
        }

        const userMessage = {
            content: input,
            message_from: 'user',
            created_at: new Date().toISOString(),
            type: 'database',
        };

        const updatedMessages = await addMessage(
            currentChat.chatId,
            userMessage,
            true
        );

        const chatWithUpdatedMessages = {
            ...currentChat,
            messages: updatedMessages,
        };
        try {
            if (socket) {
                socket.emit('chat', {
                    selectedChat: chatWithUpdatedMessages,
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
        return () => {
            currentSocket.off('chat_response', handleStreamingResponse);
        };
    }, [handleStreamingResponse, socket]);

    return {
        addMessage,
        sendMessage,
        clearChat,
    };
};
