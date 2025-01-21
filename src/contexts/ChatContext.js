import {
    useState,
    createContext,
    useContext,
    useCallback,
    useMemo,
} from 'react';
import { AuthContext } from './AuthContext';
import { useChatManager } from '../hooks/chat/useChatManager';
import { useMessageManager } from '../hooks/chat/useMessageManager';
import { useChatSettings } from '../hooks/chat/useChatSettings';
import { useSnackbar } from './SnackbarContext';
import { useSocket } from './SocketProvider';
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { socket } = useSocket();
    const { showSnackbar } = useSnackbar();
    const { uid } = useContext(AuthContext);
    const [chatArray, setChatArray] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState({});
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
        setMessages,
        selectedChat,
        setSelectedChatId,
    };

    const chatSettings = useChatSettings({ ...commonParams });
    const chatManager = useChatManager({ ...commonParams, setLoading });

    const messageManager = useMessageManager({
        ...commonParams,
        messages,
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
                messages,
                ...chatManager,
                ...messageManager,
                ...chatSettings,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
