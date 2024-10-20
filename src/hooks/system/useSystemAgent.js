import { useState, useEffect, useCallback } from 'react';

export const useSystemAgent = (uid, socket, showSnackbar) => {
    const [systemAgentMessages, setSystemAgentMessages] = useState([]);
    const [contextFiles, setContextFiles] = useState([]);
    const handleContextFiles = useCallback((data) => {
        console.log(data);
        setContextFiles(data.files);
    }, []);
    const generateContextFiles = async (input) => {
        const userMessage = {
            content: input,
            message_from: 'user',
            uid,
            created_at: new Date().toISOString(),
        };

        try {
            if (socket) {
                socket.emit('system_agent', {
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

        return () => {
            currentSocket.off('context_files', handleContextFiles);
        };
    }, [handleContextFiles, socket]);
    
    return {
        systemAgentMessages,
        contextFiles,
        setContextFiles,
        generateContextFiles,
    };
};
