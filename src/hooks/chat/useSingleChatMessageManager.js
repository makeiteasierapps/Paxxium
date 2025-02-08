import { useCallback, useEffect } from 'react';
import { processIncomingStream } from '../../dashboards/utils/processIncomingStream';
import { useFileUpload } from './useFileUpload';

export const useSingleChatMessageManager = ({
    baseUrl,
    uid,
    showSnackbar,
    setChat,
    chat,
    socket,
    socketEvent,
    updateLocalSettings,
}) => {
    const { uploadFile } = useFileUpload();

    const handleImageUpload = async (imageContextItems) => {
        const images = imageContextItems.map((item) => item.image);
        const uploadedImages = await uploadFile(images);

        setChat((prevChat) => {
            const newContext = [...(prevChat.context || [])];

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

            const updatedChat = {
                ...prevChat,
                context: updatedContext,
            };

            // If updateLocalSettings is provided, call it
            if (updateLocalSettings) {
                updateLocalSettings({
                    chatId: prevChat.chatId,
                    uid: prevChat.uid,
                    context: updatedContext,
                });
            }

            return updatedChat;
        });
    };

    const handleStreamingResponse = useCallback(
        (data) => {
            console.log(data);
            setChat((prevChat) => {
                const currentChatThread = prevChat.messages || [];

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
                        return {
                            ...prevChat,
                            messages: updatedThread,
                        };
                    }
                } else {
                    const updatedThread = processIncomingStream(
                        currentChatThread,
                        data
                    );
                    return {
                        ...prevChat,
                        messages: updatedThread,
                    };
                }
                return prevChat;
            });
        },
        [setChat]
    );

    const sendMessage = async (input) => {
        setChat((prevChat) => {
            let currentChat = { ...prevChat };

            // Handle image uploads first if there are any images in context
            if (currentChat.context?.length) {
                const imageContextItems = currentChat.context.filter(
                    (item) => item.type === 'image' && item.image
                );

                // Upload all images and get updated context
                if (imageContextItems.length) {
                    handleImageUpload(imageContextItems).then(
                        (updatedContext) => {
                            currentChat = {
                                ...currentChat,
                                context: updatedContext,
                            };
                        }
                    );
                }
            }

            const userMessage = {
                content: input,
                message_from: 'user',
                created_at: new Date().toISOString(),
                type: 'database',
            };

            const updatedMessages = [
                ...(currentChat.messages || []),
                userMessage,
            ];
            const updatedChat = {
                ...currentChat,
                messages: updatedMessages,
            };

            if (socket) {
                socket.emit(socketEvent, {
                    selectedChat: updatedChat,
                });
            }

            return updatedChat;
        });
    };

    const clearChat = async () => {
        try {
            const response = await fetch(`${baseUrl}/messages`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
                },
                body: JSON.stringify({ chatId: chat.chatId }),
            });

            if (!response.ok) throw new Error('Failed to clear messages');

            setChat((prevChat) => ({
                ...prevChat,
                messages: [],
            }));
            localStorage.setItem(
                'singleChat',
                JSON.stringify({ ...chat, messages: [] })
            );
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    useEffect(() => {
        if (!socket) return;

        socket.on(socketEvent, handleStreamingResponse);

        return () => {
            socket.off(socketEvent, handleStreamingResponse);
        };
    }, [socket, socketEvent, handleStreamingResponse]);

    return {
        sendMessage,
        clearChat,
        handleImageUpload,
    };
};
