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
        const response = await fetch(`${backendUrl}/chat`, {
            method: 'GET',
            headers: {
                userId: uid,
                dbName: process.env.REACT_APP_DB_NAME,
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
        setMessages(messagesFromData);

        localStorage.setItem('chatArray', JSON.stringify(data));
        return data;
    }, [backendUrl, setChatArray, setMessages, uid]);

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

    const loadChat = async (chatId) => {
        // This is done so that the chat visibility persists even after the page is refreshed
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
