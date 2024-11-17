import { useState, useEffect, useCallback } from 'react';
import { processIncomingStream } from '../../dashboards/utils/processIncomingStream';
export const useSystemAgent = (uid, socket, showSnackbar) => {
    const [systemAgentMessages, setSystemAgentMessages] = useState([]);
    const [contextFiles, setContextFiles] = useState([]);
    const [pendingMessage, setPendingMessage] = useState(null);

    const handleContextFiles = useCallback((data) => {
        setContextFiles(data.files);
    }, []);

    const addMessage = useCallback(
        (newMessage) => {
            setSystemAgentMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, newMessage];
                return updatedMessages;
            });
        },
        [setSystemAgentMessages]
    );

    const handleDisplayMessage = useCallback(
        (data) => {
            if (data.should_display && pendingMessage) {
                addMessage(pendingMessage);
            }
            setPendingMessage(null);
        },
        [addMessage, pendingMessage]
    );

    const handleSystemAgentResponse = useCallback(async (data) => {
        if (data.type === 'end_of_stream') {
            setSystemAgentMessages((prevMessages) => {
                const lastUserMessageIndex = prevMessages
                    .map((m) => m.message_from)
                    .lastIndexOf('user');

                if (lastUserMessageIndex !== -1) {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[lastUserMessageIndex] = {
                        ...updatedMessages[lastUserMessageIndex],
                        image_path: data.image_path,
                    };
                    return updatedMessages;
                }
                return prevMessages;
            });
        } else {
            setSystemAgentMessages((prevMessages) => {
                const newMessageParts = processIncomingStream(
                    prevMessages,
                    data
                );
                return newMessageParts;
            });
        }
    }, []);

    const getAgentResponse = async (userMessage) => {
        try {
            const newMessage = {
                content: userMessage,
                uid,
                message_from: 'user',
                created_at: new Date().toISOString(),
            };

            setPendingMessage(newMessage);

            if (socket) {
                socket.emit('get_agent_response', newMessage);
            }
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    useEffect(() => {
        if (!socket) return;

        const currentSocket = socket;
        currentSocket.on('context_files', handleContextFiles);
        currentSocket.on('system_response', handleSystemAgentResponse);
        currentSocket.on('display_message', handleDisplayMessage);

        return () => {
            currentSocket.off('context_files', handleContextFiles);
            currentSocket.off('system_response', handleSystemAgentResponse);
            currentSocket.off('display_message', handleDisplayMessage);
        };
    }, [
        handleSystemAgentResponse,
        handleContextFiles,
        handleDisplayMessage,
        socket,
    ]);

    return {
        systemAgentMessages,
        contextFiles,
        setContextFiles,
        getAgentResponse,
    };
};
