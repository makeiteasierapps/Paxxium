import { useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';

export const useSocketConnection = () => {
    const wsBackendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const [socket, setSocket] = useState(null);

    const connect = useCallback(() => {
        if (!socket) {
            console.log('Attempting to connect to:', wsBackendUrl);
            const newSocket = io(wsBackendUrl, {
                path: '/api/socket.io',
            });
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Connected to WebSocket server');
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Disconnected from WebSocket server:', reason);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Connect error:', error);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        }
    }, [wsBackendUrl, socket]);

    const disconnect = useCallback(() => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            console.log('Disconnected from WebSocket server');
        }
    }, [socket]);

    useEffect(() => {
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [socket]);

    return { socket, connect, disconnect };
};
