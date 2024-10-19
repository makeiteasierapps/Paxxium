import { useState } from 'react';

export const useSystemAgent = (uid, socket, showSnackbar) => {
    const [systemAgentMessages, setSystemAgentMessages] = useState([]);
    const messageSystemAgent = async (input) => {
        const userMessage = {
            content: input,
            message_from: 'user',
            created_at: new Date().toISOString(),
        };

        try {
            if (socket) {
                socket.emit('system_agent', {
                    uid,
                    userMessage,
                });
            }
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };

    return {
        systemAgentMessages,
        messageSystemAgent,
    };
};
