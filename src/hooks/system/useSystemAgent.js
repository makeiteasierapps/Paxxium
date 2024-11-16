import { useState, useEffect, useCallback } from 'react';
import { processIncomingStream } from '../../dashboards/utils/processIncomingStream';
export const useSystemAgent = (uid, socket, showSnackbar) => {
    const [systemAgentMessages, setSystemAgentMessages] = useState([]);
    const [contextFiles, setContextFiles] = useState([]);
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
                content: userMessage.query,
                message_from: 'user',
                created_at: new Date().toISOString(),
            };

            addMessage(newMessage);

            if (socket) {
                socket.emit('get_agent_response', userMessage);
            }
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    const generateContextFiles = async (input) => {
        const userMessage = {
            content: input,
            message_from: 'user',
            uid,
            created_at: new Date().toISOString(),
        };

        try {
            if (socket) {
                socket.emit('file_router', {
                    userMessage,
                });
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
        return () => {
            currentSocket.off('context_files', handleContextFiles);
            currentSocket.off('system_response', handleSystemAgentResponse);
        };
    }, [handleSystemAgentResponse, handleContextFiles, socket]);

    return {
        systemAgentMessages,
        contextFiles,
        setContextFiles,
        generateContextFiles,
        getAgentResponse,
    };
};
