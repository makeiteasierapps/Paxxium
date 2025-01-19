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
            console.log('🔄 Attempting to connect to:', wsBackendUrl);
            const newSocket = io(wsBackendUrl, {
                // Better connection handling options
                transports: ['websocket'],
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                timeout: 10000,
            });

            // Connection success
            newSocket.on('connect', () => {
                console.log('🟢 Connected successfully', {
                    id: newSocket.id,
                    connected: newSocket.connected,
                });
            });

            // Connection dropped
            newSocket.on('disconnect', (reason) => {
                console.log('🔴 Connection dropped:', {
                    reason,
                    wasConnected: newSocket.connected,
                    attempts: newSocket.attempts,
                });

                // Handle specific disconnect reasons
                switch (reason) {
                    case 'io server disconnect':
                        console.error(
                            '⚠️ Server forcefully disconnected the client'
                        );
                        break;
                    case 'transport close':
                        console.error('⚠️ Connection lost - network issue');
                        break;
                    case 'ping timeout':
                        console.error('⚠️ Connection timed out');
                        break;
                    default:
                        console.error('⚠️ Disconnected:', reason);
                }
            });

            // Connection error
            newSocket.on('connect_error', (error) => {
                console.error('❌ Connection error:', {
                    message: error.message,
                    type: error.type,
                    stack: error.stack,
                    data: error.data,
                });
            });

            // Generic socket error
            newSocket.on('error', (error) => {
                console.error('❌ Socket error:', {
                    message: error?.message || 'Unknown error',
                    data: error?.data,
                    stack: error?.stack,
                    fullError: error,
                });
            });

            // Attempting to reconnect
            newSocket.on('reconnect_attempt', (attemptNumber) => {
                console.log('🔄 Attempting to reconnect:', {
                    attempt: attemptNumber,
                    delay: newSocket.reconnectionDelay,
                });
            });

            // Reconnection failed
            newSocket.on('reconnect_failed', () => {
                console.error('❌ Failed to reconnect after maximum attempts');
            });

            setSocket(newSocket);
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
