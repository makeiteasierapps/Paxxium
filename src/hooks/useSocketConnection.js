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
                transports: ['websocket'],
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            });

            // Debug all events before setting up any listeners
            const debugSocket = new Proxy(newSocket, {
                get: (target, prop) => {
                    if (prop === 'emit') {
                        return function (eventName, ...args) {
                            console.log('🔵 Emitting:', eventName, ...args);
                            return target.emit.call(target, eventName, ...args);
                        };
                    }
                    if (prop === 'on') {
                        return function (eventName, callback) {
                            const wrappedCallback = (...args) => {
                                console.log('🟢 Received:', eventName, ...args);
                                return callback.apply(target, args);
                            };
                            return target.on.call(
                                target,
                                eventName,
                                wrappedCallback
                            );
                        };
                    }
                    return target[prop];
                },
            });

            setSocket(debugSocket);

            // Set up event listeners using the proxied socket
            debugSocket.on('connect', () => {
                console.log('🟢 Connected to WebSocket server');
            });

            debugSocket.on('disconnect', (reason) => {
                console.log('🔴 Disconnected from WebSocket server:', reason);
            });

            debugSocket.on('connect_error', (error) => {
                console.error('🔴 Connect error:', {
                    message: error.message,
                    stack: error.stack,
                });
            });

            debugSocket.on('error', (error) => {
                console.error('🔴 Socket error:', {
                    message: error?.message,
                    data: error?.data,
                    stack: error?.stack,
                    fullError: error,
                });
            });

            // Add a catch-all listener for any other events
            debugSocket.onAny((eventName, ...args) => {
                console.log('🟣 Caught event:', eventName, ...args);
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
