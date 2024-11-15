import { useState, useEffect, useCallback } from 'react';

export const useSystemAgent = (uid, socket, showSnackbar) => {
    const [systemAgentMessages, setSystemAgentMessages] = useState([]);
    const [agentResponse, setAgentResponse] = useState(null);
    const [contextFiles, setContextFiles] = useState([]);
    const handleContextFiles = useCallback((data) => {
        console.log(data);
        setContextFiles(data.files);
    }, []);

    const handleAgentResponse = useCallback((data) => {
        console.log(data);
        setAgentResponse(data);
    }, []);

    const getAgentResponse = async (userMessage) => {
        try {
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
        currentSocket.on('agent_response', handleAgentResponse);
        return () => {
            currentSocket.off('context_files', handleContextFiles);
        };
    }, [handleAgentResponse, handleContextFiles, socket]);

    return {
        systemAgentMessages,
        contextFiles,
        setContextFiles,
        generateContextFiles,
        getAgentResponse,
        agentResponse,
    };
};
