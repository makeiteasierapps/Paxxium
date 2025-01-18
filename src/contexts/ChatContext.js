import { useState, createContext, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { useChatManager } from '../hooks/chat/useChatManager';
import { useMessageManager } from '../hooks/chat/useMessageManager';
import { useChatSettings } from '../hooks/chat/useChatSettings';
import { useInputDetection } from '../hooks/chat/useInputDetection';
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

    const getSelectedChat = useCallback(() => {
        return chatArray.find((chat) => chat.chatId === selectedChatId);
    }, [chatArray, selectedChatId]);

    const commonParams = {
        backendUrl,
        uid,
        showSnackbar,
        chatArray,
        setChatArray,
        setMessages,
        selectedChatId,
        setSelectedChatId,
        getSelectedChat,
    };

    const chatSettings = useChatSettings({ ...commonParams });

    const inputDetection = useInputDetection({
        updateLocalSettings: chatSettings.updateLocalSettings,
        handleUpdateSettings: chatSettings.handleUpdateSettings,
        getSelectedChat,
    });

    const chatManager = useChatManager({ ...commonParams, setLoading });

    const messageManager = useMessageManager({
        ...commonParams,
        messages,
        socket,
        validateMentions: inputDetection.validateMentions,
    });

    return (
        <ChatContext.Provider
            value={{
                loading,
                setLoading,
                chatArray,
                selectedChatId,
                getSelectedChat,
                setSelectedChatId,
                messages,
                ...chatManager,
                ...messageManager,
                ...chatSettings,
                ...inputDetection,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
