import { useEffect } from 'react';
import { useBaseMessageManager } from './useBaseMessageManager';

export const useSystemMessageManager = (props) => {
    const baseManager = useBaseMessageManager({
        ...props,
        storageKey: 'systemChatArray',
    });

    const sendMessage = async (input) => {
        const { currentChat, updatedMessages } = await baseManager.baseSendMessage(input);
        
        const chatWithUpdatedMessages = {
            ...currentChat,
            messages: updatedMessages,
        };

        try {
            if (props.socket) {
                props.socket.emit(props.socketEvent, {
                    selectedChat: chatWithUpdatedMessages,
                });
            }
        } catch (error) {
            console.error(error);
            props.showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    useEffect(() => {
        if (!props.socket) return;

        const currentSocket = props.socket;
        currentSocket.on(props.socketEvent, baseManager.handleStreamingResponse);
        currentSocket.on('chat_settings_updated', baseManager.handleChatSettingsUpdated);

        return () => {
            currentSocket.off(props.socketEvent, baseManager.handleStreamingResponse);
            currentSocket.off('chat_settings_updated', baseManager.handleChatSettingsUpdated);
        };
    }, [baseManager.handleStreamingResponse, baseManager.handleChatSettingsUpdated, props.socket, props.socketEvent]);

    return {
        ...baseManager,
        sendMessage,
    };
};