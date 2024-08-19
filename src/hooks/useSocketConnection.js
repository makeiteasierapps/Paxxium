import { useRef, useCallback } from 'react';
import io from 'socket.io-client';

export const useSocketConnection = () => {
    const wsBackendUrl =
        process.env.NODE_ENV === 'development'
            ? `ws://${process.env.REACT_APP_BACKEND_URL}`
            : `wss://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const socket = useRef(null);

    const connect = useCallback(() => {
        if (!socket.current) {
            console.log('Attempting to connect to:', wsBackendUrl);
            socket.current = io(wsBackendUrl);

            socket.current.on('connect', () => {
                console.log('Connected to WebSocket server');
            });

            socket.current.on('disconnect', (reason) => {
                console.log('Disconnected from WebSocket server:', reason);
            });

            socket.current.on('connect_error', (error) => {
                console.error('Connect error:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error description:', error.description);
            });

            socket.current.on('error', (error) => {
                console.error('Socket error:', error);
            });
        }
    }, [wsBackendUrl]);

    const disconnect = useCallback(() => {
        if (socket.current) {
            socket.current.disconnect();
            socket.current = null;
            console.log('Disconnected from WebSocket server');
        }
    }, []);

    return { socket, connect, disconnect };
};
