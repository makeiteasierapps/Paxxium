import { useState } from 'react';

export const useChatSettings = (backendUrl, showSnackbar, setChatArray) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const updateSettings = async (newAgentSettings) => {
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
                // Update localStorage here, inside the setter function
                localStorage.setItem(
                    'chatArray',
                    JSON.stringify(updatedChatArray)
                );
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
