import { useCallback, useEffect } from 'react';

export const useChatManager = (
    backendUrl,
    uid,
    showSnackbar,
    setChatArray,
    setMessages,
    setLoading
) => {
    const fetchChatsFromDB = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/chat`, {
                method: 'GET',
                headers: {
                    userId: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(
                    `Failed to load user conversations: ${response.status} ${response.statusText}. ${errorBody}`
                );
            }

            const data = await response.json();

            setChatArray(data);

            setMessages((prevMessages) => {
                const messagesFromData = data.reduce((acc, chat) => {
                    if (chat.messages) {
                        acc[chat.chatId] = chat.messages;
                    }
                    return acc;
                }, {});
                return messagesFromData;
            });

            localStorage.setItem('chatArray', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error in fetchChatsFromDB:', error);
            showSnackbar(`Failed to fetch chats: ${error.message}`, 'error');
            throw error;
        }
    }, [backendUrl, setChatArray, setMessages, uid, showSnackbar]);

    const getChats = useCallback(async () => {
        try {
            const cachedChats = JSON.parse(localStorage.getItem('chatArray'));
            if (cachedChats && cachedChats.length > 0) {
                setChatArray(cachedChats);

                setMessages((prevMessages) => {
                    return cachedChats.reduce((acc, chat) => {
                        if (chat.messages) {
                            acc[chat.chatId] = chat.messages;
                        }
                        return acc;
                    }, {});
                });
            } else {
                return await fetchChatsFromDB();
            }
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            throw error;
        }
    }, [fetchChatsFromDB, setChatArray, setMessages, showSnackbar]);

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
                    dbName: process.env.REACT_APP_DB_NAME,
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

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(
                    `Failed to create chat: ${response.status} ${response.statusText}. ${errorBody}`
                );
            }

            setChatArray((prevAgents) => [data, ...prevAgents]);

            const updatedChatArray = [
                data,
                ...JSON.parse(localStorage.getItem('chatArray') || '[]'),
            ];
            localStorage.setItem('chatArray', JSON.stringify(updatedChatArray));
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    // combine loadChat and closeChat, they are almost identical
    const loadChat = async (chatId) => {
        try {
            const response = await fetch(
                `${backendUrl}/chat/update_visibility`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        dbName: process.env.REACT_APP_DB_NAME,
                        userId: uid,
                    },
                    body: JSON.stringify({ chatId, is_open: true }),
                }
            );

            if (!response.ok) throw new Error('Failed to update chat');

            // Update the local state only after the database has been updated successfully
            setChatArray((prevAgents) => {
                const updatedAgents = prevAgents.map((agent) =>
                    agent.chatId === chatId
                        ? { ...agent, is_open: true }
                        : agent
                );

                const updatedAgentIndex = updatedAgents.findIndex(
                    (agent) => agent.chatId === chatId
                );

                if (updatedAgentIndex !== -1) {
                    // Move the updated agent to the start of the array
                    const [updatedAgent] = updatedAgents.splice(
                        updatedAgentIndex,
                        1
                    );
                    updatedAgents.unshift(updatedAgent);

                    // Cache the updated agents array in local storage
                    localStorage.setItem(
                        'chatArray',
                        JSON.stringify(updatedAgents)
                    );
                    return updatedAgents;
                }

                // If the agent was not found, return the original array
                return prevAgents;
            });
        } catch (error) {
            console.log(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            throw error;
        }
    };

    const closeChat = async (chatId) => {
        try {
            const response = await fetch(
                `${backendUrl}/chat/update_visibility`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        dbName: process.env.REACT_APP_DB_NAME,
                        userId: uid,
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

    const deleteChat = async (chatId) => {
        try {
            const response = await fetch(`${backendUrl}/chat`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
                    userId: uid,
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

    useEffect(() => {
        if (!uid) {
            return;
        }
        getChats().then(() => {
            setLoading(false);
        });
    }, [getChats, setLoading, uid]);

    return {
        getChats,
        fetchChatsFromDB,
        createChat,
        loadChat,
        closeChat,
        deleteChat,
    };
};
