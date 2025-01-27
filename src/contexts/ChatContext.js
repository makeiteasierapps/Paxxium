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
import { createBaseChatManager } from '../utils/baseChatManager.js';
import { createBaseSettingsManager } from '../utils/baseSettingsManager';
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

    const commonParams = {
        backendUrl,
        uid,
        showSnackbar,
        chatArray,
        setChatArray,
        selectedChat,
        setSelectedChatId,
    };

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
        ...commonParams,
        updateLocalSettings: settingsManager.updateLocalSettings,
        socket,
    });

    return (
        <ChatContext.Provider
            value={{
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
