import { useCallback, useEffect, useRef, useContext } from 'react';
import { processIncomingStream } from '../../dashboards/utils/processIncomingStream';
import { KbContext } from '../../contexts/KbContext';
export const useMessageManager = ({
    backendUrl,
    uid,
    showSnackbar,
    selectedChat,
    setChatArray,
    setMessages,
    messages,
    socket,
    detectedUrls,
}) => {
    const selectedChatId = useRef(null);
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
                return {
                    ...prevMessages,
                    [chatId]: updatedMessages,
                };
            });
        },
        [setMessages, updateChatArrayAndMessages]
    );

    // Used to get the messages for a specific chat
    // Sent in as chat history
    const getMessages = (chatId) => {
        return messages[chatId] || [];
    };

    const extractKbName = (input) => {
        const regex = /@([\w-]+)/;
        const match = input.match(regex);
        if (match) {
            return match[1].replace(/-/g, ' ');
        }
        return null;
    };

    const getKbId = (kbName) => {
        const kb = kbArray.find((kb) => kb.name === kbName);
        return kb ? kb.id : null;
    };

    const sendMessage = async (input, image = null) => {
        let kbId = null;
        let imageBlob = null;

        if (kbArray.length > 0) {
            const kbName = extractKbName(input);
            kbId = getKbId(kbName);
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
        addMessage(selectedChat.chatId, userMessage, true);
        const chatHistory = await getMessages(selectedChat.chatId);
        try {
            if (socket) {
                socket.emit('chat', {
                    uid,
                    chatId: selectedChat.chatId,
                    imageBlob,
                    fileName: imageBlob ? imageBlob.name : null,
                    chatSettings: selectedChat,
                    chatHistory,
                    userMessage,
                    kbId,
                    urls: detectedUrls,
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
            console.log('streaming response', data);
            selectedChatId.current = data.room;
            if (data.type === 'end_of_stream') {
                // Update the most recent user message with the image path
                const chatMessages = messages[selectedChatId.current];
                const lastUserMessageIndex = chatMessages
                    .map((m) => m.message_from)
                    .lastIndexOf('user');

                if (lastUserMessageIndex !== -1) {
                    const updatedMessages = [...chatMessages];
                    updatedMessages[lastUserMessageIndex] = {
                        ...updatedMessages[lastUserMessageIndex],
                        image_path: data.image_path,
                    };

                    updateChatArrayAndMessages(
                        selectedChatId.current,
                        updatedMessages
                    );
                }
            } else {
                const newMessageParts = processIncomingStream(
                    messages,
                    data,
                    selectedChatId.current
                );
                updateChatArrayAndMessages(
                    selectedChatId.current,
                    newMessageParts[selectedChatId.current]
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
        getMessages,
        sendMessage,
        clearChat,
        handleStreamingResponse,
    };
};
