import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { useSocket } from './SocketProvider';
import { useSystemFileManager } from '../hooks/system/useSystemFilesManager';
import { useMessageManager } from '../hooks/chat/useMessageManager';
import { useSnackbar } from './SnackbarContext';
import { createBaseChatManager } from '../utils/baseChatManager.js';
import { createBaseSettingsManager } from '../utils/baseSettingsManager.js';
export const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
    const [systemChatArray, setSystemChatArray] = useState([]);
    const [selectedSystemChatId, setSelectedSystemChatId] = useState(null);
    const [systemLoading, setSystemLoading] = useState(true);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const selectedSystemChat = useMemo(
        () =>
            systemChatArray.find(
                (chat) => chat.chatId === selectedSystemChatId
            ),
        [systemChatArray, selectedSystemChatId]
    );

    const { showSnackbar } = useSnackbar();
    const { uid } = useContext(AuthContext);
    const { socket } = useSocket();
    const systemFileManager = useSystemFileManager(
        uid,
        backendUrl,
        showSnackbar
    );

    const baseManager = useMemo(() => {
        return createBaseChatManager({
            baseUrl: `${backendUrl}/system/chat`,
            storageKey: 'systemChatArray',
            uid,
            showSnackbar,
            setChatArray: setSystemChatArray,
            setSelectedChatId: setSelectedSystemChatId,
        });
    }, [
        backendUrl,
        uid,
        showSnackbar,
        setSystemChatArray,
        setSelectedSystemChatId,
    ]);

    const settingsManager = useMemo(() => {
        return createBaseSettingsManager({
            baseUrl: `${backendUrl}/system/chat`,
            storageKey: 'systemChatArray',
            uid,
            showSnackbar,
            setChatArray: setSystemChatArray,
            selectedChatId: selectedSystemChatId,
        });
    }, [
        backendUrl,
        uid,
        showSnackbar,
        setSystemChatArray,
        selectedSystemChatId,
    ]);

    const messageManager = useMessageManager({
        baseUrl: `${backendUrl}/system/chat`,
        uid,
        showSnackbar,
        setChatArray: setSystemChatArray,
        socket,
        socketEvent: 'system_chat_response',
        selectedChat: selectedSystemChat,
        updateLocalSettings: settingsManager.updateLocalSettings,
    });

    useEffect(() => {
        if (!uid) return;
        baseManager.getChats().then(() => {
            setSystemLoading(false);
        });
    }, [baseManager, setSystemLoading, uid]);

    const value = {
        backendUrl,
        showSnackbar,
        systemLoading,
        socket,
        systemChatArray,
        selectedSystemChat,
        setSelectedSystemChatId,
        ...systemFileManager,
        ...baseManager,
        ...settingsManager,
        ...messageManager,
    };

    return (
        <SystemContext.Provider value={value}>
            {children}
        </SystemContext.Provider>
    );
};
