import { useEffect, useMemo } from 'react';
import { createBaseChatManager } from '../../utils/createBaseChatManager';

export const useChatManager = ({
    backendUrl,
    uid,
    showSnackbar,
    setChatArray,
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
            setSelectedChatId,
        });
    }, [backendUrl, uid, showSnackbar, setChatArray, setSelectedChatId]);

    useEffect(() => {
        if (!uid) return;
        baseManager.getChats().then(() => {
            setLoading(false);
        });
    }, [baseManager, setLoading, uid]);

    return baseManager;
};
