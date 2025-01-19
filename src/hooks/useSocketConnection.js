import { useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';

export const useSocketConnection = () => {
    const wsBackendUrl =
        process.env.NODE_ENV === 'development'
            ? `ws://${process.env.REACT_APP_BACKEND_URL}`
            : 'wss://paxxium.com';

    const [socket, setSocket] = useState(null);

    const connect = useCallback(() => {
        if (!socket) {
            console.log('Attempting to connect to:', wsBackendUrl);
            const newSocket = io(wsBackendUrl, {
                // Add transport options for better debugging
                transports: ['websocket'],
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            });
            setSocket(newSocket);

            // Enhanced error handling
            newSocket.on('connect', () => {
                console.log('Connected to WebSocket server');
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Disconnected from WebSocket server:', reason);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Connect error:', error.message, error.stack);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', {
                    message: error.message,
                    data: error.data,
                    stack: error.stack,
                    fullError: error,
                });
            });

            // Add debugging for all emitted events
            const originalEmit = newSocket.emit;
            newSocket.emit = function (eventName, ...args) {
                console.log(`Emitting ${eventName}:`, ...args);
                return originalEmit.apply(this, [eventName, ...args]);
            };

            // Add debugging for all received events
            const originalOn = newSocket.on;
            newSocket.on = function (eventName, callback) {
                return originalOn.call(this, eventName, (...args) => {
                    console.log(`Received ${eventName}:`, ...args);
                    return callback.apply(this, args);
                });
            };
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
