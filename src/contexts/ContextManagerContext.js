import { createContext, useContext } from 'react';
import { ChatContext } from './ChatContext';
import { useInputDetection } from '../hooks/chat/useInputDetection';
import { useContextManager } from '../hooks/chat/useContextManager';
import { useImageHandling } from '../hooks/chat/useImageHandling';
import { KbContext } from './KbContext';

export const ContextManagerContext = createContext();

export const ContextManagerProvider = ({ children }) => {
    const { updateSettings, updateLocalSettings, selectedChat, chatArray } =
        useContext(ChatContext);
    const { kbArray } = useContext(KbContext);

    const contextManager = useContextManager({
        selectedChat,
        updateSettings,
        updateLocalSettings,
    });

    const imageHandling = useImageHandling({
        addContextItem: contextManager.addContextItem,
    });

    const inputDetection = useInputDetection({
        addContextItem: contextManager.addContextItem,
        updateSettings,
        selectedChat,
        kbArray,
        chatArray,
    });

    return (
        <ContextManagerContext.Provider
            value={{
                ...inputDetection,
                ...contextManager,
                ...imageHandling,
            }}
        >
            {children}
        </ContextManagerContext.Provider>
    );
};
