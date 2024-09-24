import React, { createContext, useContext, useEffect } from 'react';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { AuthContext } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { isAuthorized } = useContext(AuthContext);
    const { socket, connect, disconnect } = useSocketConnection();

    useEffect(() => {
        if (isAuthorized) {
            connect();
        } else {
            disconnect();
        }
    }, [isAuthorized, connect, disconnect]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);