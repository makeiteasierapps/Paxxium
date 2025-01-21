import { createContext, useContext } from 'react';
import { ChatContext } from './ChatContext';
import { useInputDetection } from '../hooks/chat/useInputDetection';
import { useContextManager } from '../hooks/chat/useContextManager';
import { KbContext } from './KbContext';

export const ContextManagerContext = createContext();

export const ContextManagerProvider = ({ children }) => {
    const { handleUpdateSettings, selectedChat, chatArray } =
        useContext(ChatContext);
    const { kbArray } = useContext(KbContext);
    const contextManager = useContextManager({
        selectedChat,
        handleUpdateSettings,
    });

    const inputDetection = useInputDetection({
        onUrlDetected: (url) => contextManager.addContextItem('url', url),
        onKbSelected: (kb) => contextManager.addContextItem('kb', kb),
        handleUpdateSettings,
        selectedChat,
        kbArray,
        chatArray,
    });

    return (
        <ContextManagerContext.Provider
            value={{
                ...inputDetection,
                ...contextManager,
            }}
        >
            {children}
        </ContextManagerContext.Provider>
    );
};
