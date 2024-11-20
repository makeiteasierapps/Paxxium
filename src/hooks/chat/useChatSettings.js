import { useState } from 'react';

export const useChatSettings = ({
    backendUrl,
    showSnackbar,
    setChatArray,
    selectedChat,
    setSelectedChat,
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleUpdateSettings = (newSettings) => {
        updateSettings({
            chatId: selectedChat.chatId,
            uid: selectedChat.uid,
            ...newSettings,
        });
    };

    const updateSettings = async (newAgentSettings) => {
        console.log('newAgentSettings', newAgentSettings);
        try {
            const response = await fetch(`${backendUrl}/chat/update_settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: newAgentSettings.uid,
                },
                body: JSON.stringify(newAgentSettings),
            });

            if (!response.ok) throw new Error('Failed to update settings');

            // Update the local settings state
            setChatArray((prevChatArray) => {
                const updatedChatArray = prevChatArray.map((agent) =>
                    agent.chatId === newAgentSettings.chatId
                        ? { ...agent, ...newAgentSettings }
                        : agent
                );

                // Update localStorage
                localStorage.setItem(
                    'chatArray',
                    JSON.stringify(updatedChatArray)
                );

                // Update selectedChat if it's the one being modified
                if (
                    selectedChat &&
                    selectedChat.chatId === newAgentSettings.chatId
                ) {
                    setSelectedChat({ ...selectedChat, ...newAgentSettings });
                }

                return updatedChatArray;
            });

            showSnackbar('Settings updated successfully', 'success');
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    return { isSettingsOpen, setIsSettingsOpen, handleUpdateSettings };
};
