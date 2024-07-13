import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

export const useSocketConnection = () => {
    const wsBackendUrl =
        process.env.NODE_ENV === 'development'
            ? `ws://${process.env.REACT_APP_BACKEND_URL}`
            : `wss://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const socket = useRef(null);

    useEffect(() => {
        socket.current = io(wsBackendUrl);

        socket.current.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.current.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        socket.current.on('connect_error', (error) => {
            console.log('Connect error', error);
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [wsBackendUrl]);

    const joinRoom = useCallback((chatId) => {
        if (socket.current) {
            socket.current.emit('join_room', { chatId });
        }
    }, []);

    return { socket, joinRoom };
};
