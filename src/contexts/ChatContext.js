import { useState, createContext, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useChatManager } from '../hooks/chat/useChatManager';
import { useMessageManager } from '../hooks/chat/useMessageManager';
import { useChatSettings } from '../hooks/chat/useChatSettings';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { useInputDetection } from '../hooks/chat/useInputDetection';
import { useSnackbar } from './SnackbarContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { showSnackbar } = useSnackbar();
    const { uid } = useContext(AuthContext);
    const [chatArray, setChatArray] = useState([]);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(true);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const { socket, joinRoom } = useSocketConnection();

    const commonParams = {
        backendUrl,
        uid,
        showSnackbar,
        setChatArray,
        setMessages,
    };

    const inputDetection = useInputDetection();
    const chatManager = useChatManager({ ...commonParams, setLoading });

    const messageManager = useMessageManager({
        ...commonParams,
        messages,
        socket,
        detectedUrls: inputDetection.detectedUrls,
    });

    const chatSettings = useChatSettings(
        backendUrl,
        showSnackbar,
        setChatArray
    );

    return (
        <ChatContext.Provider
            value={{
                loading,
                setLoading,
                chatArray,
                messages,
                socket,
                joinRoom,
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
