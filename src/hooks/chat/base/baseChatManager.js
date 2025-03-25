export const createBaseChatManager = ({
    baseUrl,
    uid,
    showSnackbar,
    setChatArray,
    setSelectedChatId,
}) => {
    const fetchChatsFromDB = async () => {
        try {
            const response = await fetch(`${baseUrl}`, {
                method: 'GET',
                headers: {
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(
                    `Failed to load conversations: ${response.status} ${response.statusText}. ${errorBody}`
                );
            }

            const data = await response.json();
            const sortedData = data.sort(
                (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
            );

            setChatArray(sortedData);
            if (sortedData.length > 0) {
                setSelectedChatId(sortedData[0].chatId);
            }

            return sortedData;
        } catch (error) {
            console.error('Error in fetchChatsFromDB:', error);
            showSnackbar(`Failed to fetch chats: ${error.message}`, 'error');
            throw error;
        }
    };

    const getChats = async () => {
        try {
            return await fetchChatsFromDB();
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            throw error;
        }
    };

    const createChat = async (additionalData = {}) => {
        try {
            const response = await fetch(`${baseUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
                },
                body: JSON.stringify({ uid, ...additionalData }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(
                    `Failed to create chat: ${response.status} ${response.statusText}. ${errorBody}`
                );
            }

            const data = await response.json();
            setChatArray((prevChats) => [data, ...prevChats]);
            setSelectedChatId(data.chatId);

            return data;
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            throw error;
        }
    };

    const deleteChat = async (chatId) => {
        try {
            const response = await fetch(`${baseUrl}`, {
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

                if (updatedChatArray.length > 0) {
                    setSelectedChatId(updatedChatArray[0].chatId);
                }

                return updatedChatArray;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            throw error;
        }
    };

    return {
        fetchChatsFromDB,
        getChats,
        createChat,
        deleteChat,
    };
};
