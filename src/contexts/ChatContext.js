import {
    useState,
    createContext,
    useContext,
    useCallback,
    useMemo,
    useEffect,
} from 'react';
import { AuthContext } from './AuthContext';
import { useMessageManager } from '../hooks/chat/useMessageManager';
import { useSnackbar } from './SnackbarContext';
import { useSocket } from './SocketProvider';
import { createBaseChatManager } from '../hooks/chat/base/baseChatManager.js';
import { createBaseSettingsManager } from '../hooks/chat/base/baseSettingsManager.js';
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { socket } = useSocket();
    const { showSnackbar } = useSnackbar();
    const { uid } = useContext(AuthContext);
    const [chatArray, setChatArray] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [loading, setLoading] = useState(true);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const selectedChat = useMemo(
        () => chatArray.find((chat) => chat.chatId === selectedChatId),
        [chatArray, selectedChatId]
    );

    const updateSelectedChat = useCallback(
        (updates) => {
            setChatArray((prevChats) =>
                prevChats.map((chat) =>
                    chat.chatId === selectedChatId
                        ? { ...chat, ...updates }
                        : chat
                )
            );
        },
        [selectedChatId]
    );

    const baseManager = useMemo(() => {
        return createBaseChatManager({
            baseUrl: `${backendUrl}/chat`,
            storageKey: 'chatArray',
            uid,
            showSnackbar,
            setChatArray,
            setSelectedChatId,
        });
    }, [backendUrl, uid, showSnackbar, setChatArray, setSelectedChatId]);

    const settingsManager = useMemo(() => {
        return createBaseSettingsManager({
            baseUrl: `${backendUrl}/chat`,
            storageKey: 'chatArray',
            uid,
            selectedChatId,
            showSnackbar,
            setChatArray,
        });
    }, [backendUrl, uid, showSnackbar, setChatArray, selectedChatId]);

    useEffect(() => {
        if (!uid) return;
        baseManager.getChats().then(() => {
            setLoading(false);
        });
    }, [baseManager, setLoading, uid]);

    const messageManager = useMessageManager({
        baseUrl: `${backendUrl}/chat`,
        uid,
        showSnackbar,
        setChatArray,
        socket,
        socketEvent: 'chat_response',
        selectedChat,
        updateLocalSettings: settingsManager.updateLocalSettings,
    });

    return (
        <ChatContext.Provider
            value={{
                backendUrl,
                loading,
                setLoading,
                chatArray,
                selectedChat,
                updateSelectedChat,
                setSelectedChatId,
                ...baseManager,
                ...messageManager,
                ...settingsManager,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
