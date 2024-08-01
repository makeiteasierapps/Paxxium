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
            console.log(agentModel)
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
            console.log(data)
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

    const updateChatVisibility = async (chatId, isOpen) => {
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
                    body: JSON.stringify({ chatId, is_open: isOpen }),
                }
            );

            if (!response.ok) throw new Error('Failed to update chat');

            setChatArray((prevChatArray) => {
                const updatedChatArray = prevChatArray.map((chatObj) =>
                    chatObj.chatId === chatId
                        ? { ...chatObj, is_open: isOpen }
                        : chatObj
                );

                if (isOpen) {
                    const updatedChatIndex = updatedChatArray.findIndex(
                        (chat) => chat.chatId === chatId
                    );
                    if (updatedChatIndex !== -1) {
                        const [updatedChat] = updatedChatArray.splice(
                            updatedChatIndex,
                            1
                        );
                        updatedChatArray.unshift(updatedChat);
                    }
                }

                localStorage.setItem(
                    'chatArray',
                    JSON.stringify(updatedChatArray)
                );
                return updatedChatArray;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            if (isOpen) throw error;
        }
    };

    const loadChat = (chatId) => updateChatVisibility(chatId, true);
    const closeChat = (chatId) => updateChatVisibility(chatId, false);

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
