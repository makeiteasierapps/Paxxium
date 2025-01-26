export const createBaseSettingsManager = ({
    baseUrl,
    storageKey,
    uid,
    showSnackbar,
    setChatArray,
}) => {
    const updateLocalSettings = (newSettings) => {
        setChatArray((prevChatArray) => {
            const updatedChatArray = prevChatArray.map((chat) =>
                chat.chatId === newSettings.chatId
                    ? { ...chat, ...newSettings }
                    : chat
            );

            localStorage.setItem(storageKey, JSON.stringify(updatedChatArray));
            return updatedChatArray;
        });
    };

    const updateSettings = async (newSettings) => {
        try {
            const response = await fetch(`${baseUrl}/update_settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
                },
                body: JSON.stringify({
                    uid,
                    ...newSettings,
                }),
            });

            if (!response.ok) throw new Error('Failed to update settings');

            updateLocalSettings(newSettings);
            showSnackbar('Settings updated successfully', 'success');

            return response.json();
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            throw error;
        }
    };

    return {
        updateSettings,
        updateLocalSettings,
    };
};
