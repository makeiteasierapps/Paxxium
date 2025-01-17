import { useCallback, useEffect } from 'react';

export const useChatManager = ({
    backendUrl,
    uid,
    showSnackbar,
    setChatArray,
    setMessages,
    setLoading,
    setSelectedChatId,
}) => {
    const fetchChatsFromDB = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/chat`, {
                method: 'GET',
                headers: {
                    uid: uid,
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
            console.log(data);
            const sortedData = data.sort(
                (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
            );
            setChatArray(sortedData);
            // Set the most recent chat as the selected chat
            if (sortedData.length > 0) {
                setSelectedChatId(sortedData[0].chatId);
            }

            setMessages((prevMessages) => {
                const messagesFromData = data.reduce((acc, chat) => {
                    if (chat.messages) {
                        acc[chat.chatId] = chat.messages;
                    }
                    return acc;
                }, {});
                return messagesFromData;
            });

            localStorage.setItem('chatArray', JSON.stringify(sortedData));
            return sortedData;
        } catch (error) {
            console.error('Error in fetchChatsFromDB:', error);
            showSnackbar(`Failed to fetch chats: ${error.message}`, 'error');
            throw error;
        }
    }, [
        backendUrl,
        setChatArray,
        setMessages,
        uid,
        showSnackbar,
        setSelectedChatId,
    ]);

    const getChats = useCallback(async () => {
        try {
            const cachedChats = JSON.parse(localStorage.getItem('chatArray'));
            if (cachedChats && cachedChats.length > 0) {
                setChatArray(cachedChats);
                setSelectedChatId(cachedChats[0].chatId);
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
    }, [
        fetchChatsFromDB,
        setChatArray,
        setMessages,
        showSnackbar,
        setSelectedChatId,
    ]);

    const createChat = async () => {
        try {
            const response = await fetch(`${backendUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
                },
                body: JSON.stringify({ uid }),
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
            setSelectedChatId(data.chatId);
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

    const deleteChat = async (chatId) => {
        try {
            const response = await fetch(`${backendUrl}/chat`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
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

                setSelectedChatId(updatedChatArray[0].chatId);
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
        deleteChat,
    };
};
