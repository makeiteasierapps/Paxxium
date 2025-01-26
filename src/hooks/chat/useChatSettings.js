import { useState } from 'react';
import { createBaseSettingsManager } from '../../utils/baseSettingsManager';

export const useChatSettings = ({
    backendUrl,
    showSnackbar,
    setChatArray,
    selectedChat,
    uid,
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const settingsManager = createBaseSettingsManager({
        baseUrl: `${backendUrl}/chat`,
        storageKey: 'chatArray',
        uid,
        showSnackbar,
        setChatArray,
    });

    const handleUpdateSettings = (newSettings) => {
        return settingsManager.updateSettings({
            chatId: selectedChat.chatId,
            ...newSettings,
        });
    };

    return {
        isSettingsOpen,
        setIsSettingsOpen,
        handleUpdateSettings,
        updateLocalSettings: settingsManager.updateLocalSettings,
    };
};
