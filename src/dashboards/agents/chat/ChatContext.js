import {
    useState,
    createContext,
    useContext,
    useRef,
    useCallback,
    useEffect,
} from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import { processToken } from '../utils/processToken';
import { resizeImage } from '../utils/resizeImage';

import { SnackbarContext } from '../../../SnackbarContext';

export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
    const { showSnackbar } = useContext(SnackbarContext);
    const { idToken, uid } = useContext(AuthContext);
    const [agentArray, setAgentArray] = useState([]);
    const [messages, setMessages] = useState({});
    const [insideCodeBlock, setInsideCodeBlock] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const ignoreNextTokenRef = useRef(false);
    const languageRef = useRef(null);

    const messagesUrl =
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:50002'
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const chatUrl =
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:50000'
            : process.env.REACT_APP_BACKEND_URL_PROD;

    // Used to add a new user message to the messages state
    const addMessage = (chatId, newMessage) => {
        setMessages((prevMessageParts) => {
            const updatedMessages = {
                ...prevMessageParts,
                [chatId]: [...(prevMessageParts[chatId] || []), newMessage],
            };

            // Update agentArray with the new message
            setAgentArray((prevAgentArray) => {
                const updatedAgentArray = prevAgentArray.map((agent) => {
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
                    'agentArray',
                    JSON.stringify(updatedAgentArray)
                );
                return updatedAgentArray;
            });

            return updatedMessages;
        });
    };

    const getChatByProjectId = (id) => {
        return agentArray.find((agent) => agent.project_id === id);
    };

    // Used to get the messages for a specific chat
    // Sent in as chat history
    const getMessages = (chatId) => {
        return messages[chatId] || [];
    };

    const getChats = useCallback(async () => {
        try {
            const cachedChats = localStorage.getItem('agentArray');
            if (cachedChats) {
                const parsedChats = JSON.parse(cachedChats);
                setAgentArray(parsedChats);

                // New: Update messages state based on cached chats
                const cachedMessages = parsedChats.reduce((acc, chat) => {
                    if (chat.messages) {
                        acc[chat.chatId] = chat.messages;
                    }
                    return acc;
                }, {});
                setMessages(cachedMessages);

                return parsedChats;
            }

            const response = await fetch(`${chatUrl}/chat`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
            });

            if (!response.ok)
                throw new Error('Failed to load user conversations');

            const data = await response.json();
            setAgentArray(data);

            // Assuming each chat object in the data array now includes a messages array
            const messagesFromData = data.reduce((acc, chat) => {
                if (chat.messages) {
                    acc[chat.chatId] = chat.messages;
                }
                return acc;
            }, {});
            setMessages(messagesFromData); // Update messages state with the loaded data

            localStorage.setItem('agentArray', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    }, [chatUrl, idToken, setAgentArray, setMessages, showSnackbar]);

    const loadChat = async (chatId) => {
        // This is done so that the chat visibility persists even after the page is refreshed
        try {
            const response = await fetch(`${chatUrl}/chat/update_visibility`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify({ chatId, is_open: true }),
            });

            if (!response.ok) throw new Error('Failed to update chat');

            // Update the local state only after the database has been updated successfully
            setAgentArray((prevAgents) => {
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
                        'agentArray',
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

    const sendMessage = async (input, chatSettings, image = null) => {
        let imageUrl = null;
        // maybe refactor this to a separate function
        if (image) {
            imageUrl = await new Promise((resolve, reject) => {
                resizeImage(image, 400, 400, async function (resizedImageBlob) {
                    const formData = new FormData();

                    formData.append('image', resizedImageBlob, 'image.png');
                    try {
                        const response = await fetch(
                            `${messagesUrl}/messages/utils`,
                            {
                                method: 'POST',
                                headers: {
                                    Authorization: idToken,
                                },
                                body: formData,
                            }
                        );

                        if (!response.ok) {
                            throw new Error('Failed to upload image');
                        }

                        const data = await response.json();
                        resolve(data.fileUrl); // Resolve the Promise with the imageUrl
                    } catch (error) {
                        reject(error); // Reject the promise with the error
                    }
                });
            }).catch((error) => {
                console.error(error);
                showSnackbar(
                    `Network or fetch error: ${error.message}`,
                    'error'
                );
                return null;
            });
        }

        // Optimistic update
        const userMessage = {
            content: input,
            message_from: 'user',
            user_id: uid,
            time_stamp: new Date().toISOString(),
            type: 'database',
            image_url: imageUrl,
        };
        addMessage(chatSettings.chatId, userMessage);

        const chatHistory = await getMessages(chatSettings.chatId);

        const dataPacket = {
            chatSettings,
            userMessage,
            chatHistory,
            image_url: imageUrl,
        };

        try {
            const response = await fetch(`${messagesUrl}/messages/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify(dataPacket),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const reader = response.body.getReader();
            let completeMessage = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const decodedValue = new TextDecoder('utf-8').decode(value);
                // Split the decoded value by newline and filter out any empty lines
                const jsonChunks = decodedValue
                    .split('\n')
                    .filter((line) => line.trim() !== '');

                const messages = jsonChunks.map((chunk) => {
                    const messageObj = JSON.parse(chunk);
                    processToken(
                        messageObj,
                        setInsideCodeBlock,
                        insideCodeBlock,
                        setMessages,
                        chatSettings.chatId,
                        ignoreNextTokenRef,
                        languageRef
                    );
                    return messageObj.content;
                });
                completeMessage += messages.join('');
            }
            // While streaming an array of objects is being built for the stream.
            // This sets that array to a message object in the state
            setMessages((prevMessages) => {
                const updatedMessages = prevMessages[chatSettings.chatId].slice(
                    0,
                    -1
                );
                updatedMessages.push({
                    content: completeMessage,
                    message_from: 'agent',
                    type: 'database',
                });

                const newMessagesState = {
                    ...prevMessages,
                    [chatSettings.chatId]: updatedMessages,
                };

                // Update agentArray with the new message
                setAgentArray((prevAgentArray) => {
                    const updatedAgentArray = prevAgentArray.map((agent) => {
                        if (agent.chatId === chatSettings.chatId) {
                            return {
                                ...agent,
                                messages: updatedMessages,
                            };
                        }
                        return agent;
                    });

                    // Update local storage with the updated agent array
                    localStorage.setItem(
                        'agentArray',
                        JSON.stringify(updatedAgentArray)
                    );
                    return updatedAgentArray;
                });

                return newMessagesState;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const closeChat = async (chatId) => {
        try {
            const response = await fetch(`${chatUrl}/chat/update_visibility`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify({ chatId, is_open: false }),
            });

            if (!response.ok) throw new Error('Failed to update chat');

            setAgentArray((prevChatArray) => {
                const updatedChatArray = prevChatArray.map((chatObj) =>
                    chatObj.chatId === chatId
                        ? { ...chatObj, is_open: false }
                        : chatObj
                );

                // Store the updated array in local storage
                localStorage.setItem(
                    'agentArray',
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
            const response = await fetch(`${messagesUrl}/messages/clear`, {
                method: 'DELETE',
                headers: {
                    Authorization: idToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId }),
            });

            if (!response.ok) throw new Error('Failed to clear messages');

            // Update the agentArray state
            setAgentArray((prevAgentArray) => {
                const updatedAgentArray = prevAgentArray.map((agent) => {
                    if (agent.chatId === chatId) {
                        // Clear messages for the matching chat
                        return { ...agent, messages: [] };
                    }
                    return agent;
                });

                // Update local storage with the updated agent array
                localStorage.setItem(
                    'agentArray',
                    JSON.stringify(updatedAgentArray)
                );

                return updatedAgentArray;
            });

            // Update the messages state for the UI to reflect the cleared messages
            setMessages((prevMessages) => {
                const updatedMessages = { ...prevMessages, [chatId]: [] };
                // No need to update 'messages' in local storage since it's part of 'agentArray'
                return updatedMessages;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const deleteChat = async (chatId) => {
        try {
            const response = await fetch(`${chatUrl}/chat/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify({ chatId }),
            });

            if (!response.ok) throw new Error('Failed to delete conversation');

            setAgentArray((prevChatArray) => {
                const updatedChatArray = prevChatArray.filter(
                    (chatObj) => chatObj.chatId !== chatId
                );

                localStorage.setItem(
                    'agentArray',
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
            const response = await fetch(`${chatUrl}/chat/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify({
                    agentModel,
                    systemPrompt,
                    chatConstants,
                    useProfileData,
                    chatName,
                }),
            });

            if (!response.ok) throw new Error('Failed to create chat');

            const data = await response.json();
            // Update the agentArray directly here
            setAgentArray((prevAgents) => {
                const updatedAgentArray = [data, ...prevAgents];
                localStorage.setItem(
                    'agentArray',
                    JSON.stringify(updatedAgentArray)
                );
                return updatedAgentArray;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const updateSettings = async (newAgentSettings) => {
        // Update the settings in the database
        try {
            const response = await fetch(`${chatUrl}/chat/update_settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
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
        setAgentArray((prevAgentArray) => {
            const updatedAgentArray = prevAgentArray.map((agent) =>
                agent.chatId === newAgentSettings.chatId
                    ? { ...agent, ...newAgentSettings }
                    : agent
            );
            localStorage.setItem(
                'agentArray',
                JSON.stringify(updatedAgentArray)
            );
            return updatedAgentArray;
        });
    };

    useEffect(() => {
        if (!idToken) return;
        getChats().then(() => {
            setLoading(false);
        });
    }, [idToken]);

    return (
        <ChatContext.Provider
            value={{
                agentArray,
                setAgentArray,
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
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
