import { useEffect, useMemo } from 'react';
import { createBaseChatManager } from '../../utils/createBaseChatManager';

export const useChatManager = ({
    backendUrl,
    uid,
    showSnackbar,
    setChatArray,
    setMessages,
    setLoading,
    setSelectedChatId,
}) => {
    const baseManager = useMemo(() => {
        return createBaseChatManager({
            baseUrl: `${backendUrl}/chat`,
            storageKey: 'chatArray',
            uid,
            showSnackbar,
            setChatArray,
            setMessages,
            setSelectedChatId,
        });
    }, [
        backendUrl,
        uid,
        showSnackbar,
        setChatArray,
        setMessages,
        setSelectedChatId,
    ]);

    useEffect(() => {
        if (!uid) return;
        baseManager.getChats().then(() => {
            setLoading(false);
        });
    }, [baseManager, setLoading, uid]);

    return baseManager;
};
