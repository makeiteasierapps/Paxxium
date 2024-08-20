import { useState } from 'react';

export const useChatSettings = (backendUrl, showSnackbar, setChatArray, selectedChat, setSelectedChat) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const updateSettings = async (newAgentSettings) => {
        console.log('newAgentSettings', newAgentSettings);
        try {
            const response = await fetch(`${backendUrl}/chat/update_settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
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

    return { updateSettings, isSettingsOpen, setIsSettingsOpen };
};
