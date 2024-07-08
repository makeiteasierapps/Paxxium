import {
    useState,
    createContext,
    useContext,
    useRef,
    useCallback,
    useEffect,
} from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import { processIncomingStream } from '../utils/processIncomingStream';
import { resizeImage } from '../utils/resizeImage';
import { io } from 'socket.io-client';
import { SnackbarContext } from '../../../SnackbarContext';

export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);
    const [chatArray, setChatArray] = useState([]);
    const [messages, setMessages] = useState({});
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const selectedChatId = useRef(null);
    const socket = useRef(null);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const wsBackendUrl =
        process.env.NODE_ENV === 'development'
            ? `ws://${process.env.REACT_APP_BACKEND_URL}`
            : `wss://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    useEffect(() => {
        const newSocket = io(wsBackendUrl);

        socket.current = newSocket;

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        newSocket.on('connect_error', (error) => {
            console.log('Connect error', error);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

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

    const getChatByProjectId = (id) => {
        return chatArray.find((agent) => agent.project_id === id);
    };

    // Used to get the messages for a specific chat
    // Sent in as chat history
    const getMessages = (chatId) => {
        return messages[chatId] || [];
    };

    const fetchChatsFromDB = useCallback(async () => {
        const response = await fetch(`${backendUrl}/chat`, {
            method: 'GET',
            headers: {
                userId: uid,
            },
        });

        if (!response.ok) throw new Error('Failed to load user conversations');

        const data = await response.json();
        setChatArray(data);

        const messagesFromData = data.reduce((acc, chat) => {
            if (chat.messages) {
                acc[chat.chatId] = chat.messages;
            }
            return acc;
        }, {});
        console.log('messagesFromData', messagesFromData);
        setMessages(messagesFromData);

        localStorage.setItem('chatArray', JSON.stringify(data));
        return data;
    }, [backendUrl, uid]);

    const getChats = useCallback(async () => {
        try {
            const cachedChats = JSON.parse(localStorage.getItem('chatArray'));
            if (cachedChats && cachedChats.length > 0) {
                setChatArray(cachedChats);

                const cachedMessages = cachedChats.reduce((acc, chat) => {
                    if (chat.messages) {
                        acc[chat.chatId] = chat.messages;
                    }
                    return acc;
                }, {});
                setMessages(cachedMessages);
                return cachedChats;
            } else {
                return fetchChatsFromDB();
            }
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    }, [fetchChatsFromDB, showSnackbar]);

    const loadChat = async (chatId) => {
        // This is done so that the chat visibility persists even after the page is refreshed
        try {
            const response = await fetch(
                `${backendUrl}/chat/update_visibility`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ chatId, is_open: true }),
                }
            );

            if (!response.ok) throw new Error('Failed to update chat');

            // Update the local state only after the database has been updated successfully
            setChatArray((prevAgents) => {
                let updatedAgentIndex = -1;
                const updatedAgents = prevAgents.reduce((acc, agent, index) => {
                    if (agent.chatId === chatId) {
                        updatedAgentIndex = index; // Capture the index of the agent to be updated
                        return [{ ...agent, is_open: true }, ...acc]; // Place updated agent at the start
                    } else {
                        return [...acc, agent]; // Append other agents as they are
                    }
                }, []);

                // Cache the updated agents array in local storage
                if (updatedAgentIndex !== -1) {
                    localStorage.setItem(
                        'chatArray',
                        JSON.stringify(updatedAgents)
                    );
                }

                // If the agent was not found and updated, return the original array to avoid unnecessary state updates
                return updatedAgentIndex !== -1 ? updatedAgents : prevAgents;
            });
        } catch (error) {
            console.log(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const resizeAndConvertImageToBlob = (image, width, height) => {
        return new Promise((resolve, reject) => {
            resizeImage(image, width, height, (resizedImageBlob) => {
                resolve(resizedImageBlob);
            });
        });
    };

    const uploadImageAndGetUrl = async (imageBlob) => {
        const formData = new FormData();
        formData.append('image', imageBlob, 'image.png');

        try {
            const response = await fetch(`${backendUrl}/messages/utils`, {
                method: 'POST',
                headers: {
                    userId: uid,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            return data.fileUrl; // Return the image URL
        } catch (error) {
            throw new Error(`Image upload error: ${error.message}`);
        }
    };

    const sendMessage = async (input, chatSettings, image = null) => {
        let imageUrl = null;
        if (image) {
            try {
                const resizedImageBlob = await resizeAndConvertImageToBlob(
                    image,
                    400,
                    400
                );
                imageUrl = await uploadImageAndGetUrl(resizedImageBlob);
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
    };

    const handleStreamingResponse = useCallback(async (data) => {
        console.log('data', data);
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
            socket.current.off('chat_response', handleStreamingResponse);
        };
    }, [handleStreamingResponse, socket]);

    const closeChat = async (chatId) => {
        try {
            const response = await fetch(
                `${backendUrl}/chat/update_visibility`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ chatId, is_open: false }),
                }
            );

            if (!response.ok) throw new Error('Failed to update chat');

            setChatArray((prevChatArray) => {
                const updatedChatArray = prevChatArray.map((chatObj) =>
                    chatObj.chatId === chatId
                        ? { ...chatObj, is_open: false }
                        : chatObj
                );

                // Store the updated array in local storage
                localStorage.setItem(
                    'chatArray',
                    JSON.stringify(updatedChatArray)
                );

                return updatedChatArray;
            });
        } catch (error) {
            console.log(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const clearChat = async (chatId) => {
        try {
            const response = await fetch(`${backendUrl}/messages`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
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

    const deleteChat = async (chatId) => {
        try {
            const response = await fetch(`${backendUrl}/chat`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId }),
            });

            if (!response.ok) throw new Error('Failed to delete conversation');

            setChatArray((prevChatArray) => {
                const updatedChatArray = prevChatArray.filter(
                    (chatObj) => chatObj.chatId !== chatId
                );

                localStorage.setItem(
                    'chatArray',
                    JSON.stringify(updatedChatArray)
                );

                return updatedChatArray;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const createChat = async (
        agentModel,
        systemPrompt,
        chatConstants,
        useProfileData,
        chatName
    ) => {
        try {
            const response = await fetch(`${backendUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: uid,
                    agentModel,
                    systemPrompt,
                    chatConstants,
                    useProfileData,
                    chatName,
                }),
            });

            if (!response.ok) throw new Error('Failed to create chat');

            const data = await response.json();
            // Update the chatArray directly here
            setChatArray((prevAgents) => {
                const updatedChatArray = [data, ...prevAgents];
                localStorage.setItem(
                    'chatArray',
                    JSON.stringify(updatedChatArray)
                );
                return updatedChatArray;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const updateSettings = async (newAgentSettings) => {
        // Update the settings in the database
        try {
            const response = await fetch(`${backendUrl}/chat/update_settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAgentSettings),
            });

            if (!response.ok) throw new Error('Failed to update settings');

            showSnackbar('Settings updated successfully', 'success');
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }

        // Update the local settings state
        setChatArray((prevChatArray) => {
            const updatedChatArray = prevChatArray.map((agent) =>
                agent.chatId === newAgentSettings.chatId
                    ? { ...agent, ...newAgentSettings }
                    : agent
            );
            localStorage.setItem('chatArray', JSON.stringify(updatedChatArray));
            return updatedChatArray;
        });
    };

    useEffect(() => {
        if (!uid) {
            return;
        }
        getChats().then(() => {
            setLoading(false);
        });
    }, [uid]);

    return (
        <ChatContext.Provider
            value={{
                chatArray,
                setChatArray,
                messages,
                sendMessage,
                closeChat,
                clearChat,
                deleteChat,
                createChat,
                updateSettings,
                getChats,
                loadChat,
                isSettingsOpen,
                setIsSettingsOpen,
                getChatByProjectId,
                socket,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
