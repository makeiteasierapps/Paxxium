import { useState, createContext, useContext } from 'react';
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
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(true);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const commonParams = {
        backendUrl,
        uid,
        showSnackbar,
        setChatArray,
        setMessages,
        selectedChat,
        setSelectedChat,
    };

    const inputDetection = useInputDetection();
    const chatManager = useChatManager({ ...commonParams, setLoading });

    const messageManager = useMessageManager({
        ...commonParams,
        messages,
        socket,
        detectedUrls: inputDetection.detectedUrls,
    });

    const chatSettings = useChatSettings({ ...commonParams });

    return (
        <ChatContext.Provider
            value={{
                loading,
                setLoading,
                chatArray,
                selectedChat,
                setSelectedChat,
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
