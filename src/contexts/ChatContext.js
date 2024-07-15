import { useState, createContext, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useChatManager } from '../hooks/chat/useChatManager';
import { useMessageManager } from '../hooks/chat/useMessageManager';
import { useChatSettings } from '../hooks/chat/useChatSettings';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { SnackbarContext } from './SnackbarContext';

export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);
    const [chatArray, setChatArray] = useState([]);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(true);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;


    const {socket, joinRoom} = useSocketConnection();

    const chatManager = useChatManager(backendUrl, uid, showSnackbar, setChatArray, setMessages, setLoading);
    const messageManager = useMessageManager(backendUrl, uid, showSnackbar, setChatArray, setMessages, messages, socket);
    const chatSettings = useChatSettings(backendUrl, showSnackbar, setChatArray);

    const getChatByProjectId = (id) => {
        return chatArray.find((agent) => agent.project_id === id);
    };

    return (
        <ChatContext.Provider
            value={{
                loading,
                setLoading,
                chatArray,
                messages,
                socket,
                joinRoom,
                getChatByProjectId,
                ...chatManager,
                ...messageManager,
                ...chatSettings,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
