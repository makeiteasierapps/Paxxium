import { useState, createContext, useContext, useRef } from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import { processToken } from '../utils/processToken';
import { resizeImage } from '../utils/resizeImage';

import { SnackbarContext } from '../../../SnackbarContext';

export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
    const { showSnackbar } = useContext(SnackbarContext);
    const { idToken, uid } = useContext(AuthContext);
    const [agentArray, setAgentArray] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [messages, setMessages] = useState({});
    const [insideCodeBlock, setInsideCodeBlock] = useState(false);
    const ignoreNextTokenRef = useRef(false);
    const languageRef = useRef(null);

    const messagesUrl =
        process.env.NODE_ENV === 'development'
            ? process.env.REACT_APP_MESSAGES_URL
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const chatUrl =
        process.env.NODE_ENV === 'development'
            ? process.env.REACT_APP_CHAT_URL
            : process.env.REACT_APP_BACKEND_URL_PROD;

    // Used to add a new user message to the messages state
    const addMessage = (chatId, newMessage) => {
        setMessages((prevMessageParts) => ({
            ...prevMessageParts,
            [chatId]: [...(prevMessageParts[chatId] || []), newMessage],
        }));
    };

    // Used to get the messages for a specific chat
    const getMessages = (chatId) => {
        return messages[chatId] || [];
    };

    const getChatData = async () => {
        try {
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
            return data;
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`);
        }
    };

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
                // Find the agent and update it
                const updatedAgent = prevAgents.find(
                    (agent) => agent.chatId === chatId
                );
                if (updatedAgent) {
                    updatedAgent.is_open = true;
                }

                // Filter out the updated agent from the original array
                const filteredAgents = prevAgents.filter(
                    (agent) => agent.id !== chatId
                );

                // Add the updated agent to the beginning of the array
                return updatedAgent
                    ? [updatedAgent, ...filteredAgents]
                    : filteredAgents;
            });
        } catch (error) {
            console.log(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    // Fetch messages from the database
    const loadMessages = async (chatId) => {
        try {
            const messageResponse = await fetch(`${messagesUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify({ chatId }),
            });

            if (!messageResponse.ok) {
                throw new Error('Failed to load messages');
            }

            const messageData = await messageResponse.json();
            if (messageData && messageData.messages.length > 0) {
                setMessages((prevMessageParts) => ({
                    ...prevMessageParts,
                    [chatId]: messageData.messages,
                }));
            }
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const sendMessage = async (input, chatId, chatSettings, image = null) => {
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
                showSnackbar(`Network or fetch error: ${error.message}`);
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
        addMessage(chatId, userMessage);

        const chatHistory = await getMessages(chatId);

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
                        chatId,
                        ignoreNextTokenRef,
                        languageRef
                    );
                    return messageObj.content;
                });
                completeMessage += messages.join('');
            }
            // While stream an array of objects is built by the stream.
            // This sets that array to a message object in the state
            setMessages((prevMessages) => {
                const updatedMessages = prevMessages[chatId].slice(0, -1);
                updatedMessages.push({
                    content: completeMessage,
                    message_from: 'agent',
                    type: 'database',
                });

                return {
                    ...prevMessages,
                    [chatId]: updatedMessages,
                };
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

            // Update the local state only after the database has been updated successfully
            setAgentArray((prevChatArray) =>
                prevChatArray.map((chatObj) =>
                    chatObj.id === chatId
                        ? { ...chatObj, is_open: false }
                        : chatObj
                )
            );
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

            setMessages((prevMessageParts) => ({
                ...prevMessageParts,
                [chatId]: [],
            }));
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

            setAgentArray((prevChatArray) =>
                prevChatArray.filter((chatObj) => chatObj.chatId !== chatId)
            );
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
            setAgentArray((prevAgents) => [data, ...prevAgents]);

            // Set the new agent as the selectedAgent
            setSelectedAgent(data);
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
        setAgentArray((prevAgentArray) =>
            prevAgentArray.map((agent) =>
                agent.id === newAgentSettings.id
                    ? { ...agent, ...newAgentSettings }
                    : agent
            )
        );
        // Update the selected agent in the ChatContext
        setSelectedAgent(newAgentSettings);
    };

    return (
        <ChatContext.Provider
            value={{
                agentArray,
                setAgentArray,
                selectedAgent,
                setSelectedAgent,
                messages,
                loadMessages,
                sendMessage,
                closeChat,
                clearChat,
                deleteChat,
                createChat,
                updateSettings,
                getChatData,
                loadChat,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
