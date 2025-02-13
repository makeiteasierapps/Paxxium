import { createContext, useContext, useState, useEffect } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { useSocket } from './SocketProvider';
import { AuthContext } from './AuthContext';
import { useSnackbar } from './SnackbarContext';
import { useSingleChatMessageManager } from '../hooks/chat/useSingleChatMessageManager';
import { useInsightUserData } from '../hooks/chat/useInsightUserData';
import { useInsightQuestionData } from '../hooks/useInsightQuestionData';
export const InsightContext = createContext();

export const InsightProvider = ({ children }) => {
    const { uid } = useContext(AuthContext);
    const { showSnackbar } = useSnackbar();
    const { socket } = useSocket();
    // Keep useState for updatable state
    const [insightChat, setInsightChat] = useState({
        messages: [],
        chatId: 'insight',
        uid: 'none'
    });

    useEffect(() => {
        if (uid) {
            setInsightChat(prev => ({ ...prev, uid }));
        }
    }, [uid]);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const insightUserData = useInsightUserData({
        uid,
        showSnackbar,
        socket,
    });

    const insightQuestionData = useInsightQuestionData({
        uid,
        showSnackbar,
        socket,
    });

    const messageManager = useSingleChatMessageManager({
        baseUrl: `${backendUrl}/insight/chat`,
        uid,
        showSnackbar,
        setChat: setInsightChat,
        socket,
        socketEvent: 'insight_chat_response',
        updateLocalSettings: () => {},
    });
    return (
        <InsightContext.Provider
            value={{
                ...messageManager,
                ...insightUserData,
                ...insightQuestionData,
                backendUrl,
                insightChat,
                setInsightChat,
            }}
        >
            {children}
        </InsightContext.Provider>
    );
};
