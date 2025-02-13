export const createBaseChatManager = ({
    baseUrl,
    storageKey,
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

            localStorage.setItem(storageKey, JSON.stringify(sortedData));
            return sortedData;
        } catch (error) {
            console.error('Error in fetchChatsFromDB:', error);
            showSnackbar(`Failed to fetch chats: ${error.message}`, 'error');
            throw error;
        }
    };

    const getChats = async () => {
        try {
            const cachedChats = JSON.parse(localStorage.getItem(storageKey));
            if (cachedChats && cachedChats.length > 0) {
                setChatArray(cachedChats);
                setSelectedChatId(cachedChats[0].chatId);
            } else {
                return await fetchChatsFromDB();
            }
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

            const updatedChatArray = [
                data,
                ...JSON.parse(localStorage.getItem(storageKey) || '[]'),
            ];
            localStorage.setItem(storageKey, JSON.stringify(updatedChatArray));

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

                localStorage.setItem(
                    storageKey,
                    JSON.stringify(updatedChatArray)
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
