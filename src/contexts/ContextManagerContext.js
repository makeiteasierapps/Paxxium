import { createContext, useContext } from 'react';
import { ChatContext } from './ChatContext';
import { SystemContext } from './SystemContext';
import { useInputDetection } from '../hooks/chat/useInputDetection';
import { useContextManager } from '../hooks/chat/useContextManager';
import { useImageHandling } from '../hooks/chat/useImageHandling';
import { KbContext } from './KbContext';

export const ContextManagerContext = createContext();

export const ContextManagerProvider = ({ children, type = 'user' }) => {

    const userContext = useContext(ChatContext);
    const systemContext = useContext(SystemContext);
    const context = type === 'user' ? userContext : systemContext;
    const { updateSettings, updateLocalSettings } = context;
    const chatArray = type === 'user' ? context.chatArray : context.systemChatArray;
    const selectedChat =
        type === 'user' ? context.selectedChat : context.selectedSystemChat;
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
