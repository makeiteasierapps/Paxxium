import { useEffect } from 'react';
import { useBaseMessageManager } from './base/useBaseMessageManager';
export const useMessageManager = (props) => {
    const baseManager = useBaseMessageManager({
        ...props,

    });

    const sendMessage = async (input) => {
        const { currentChat, updatedMessages } =
            await baseManager.baseSendMessage(input);

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
            props.showSnackbar(
                `Network or fetch error: ${error.message}`,
                'error'
            );
        }
    };

    useEffect(() => {
        if (!props.socket) return;

        const currentSocket = props.socket;
        currentSocket.on(
            props.socketEvent,
            baseManager.handleStreamingResponse
        );

        return () => {
            currentSocket.off(
                props.socketEvent,
                baseManager.handleStreamingResponse
            );
        };
    }, [baseManager.handleStreamingResponse, props.socket, props.socketEvent]);

    return {
        ...baseManager,
        sendMessage,
    };
};
