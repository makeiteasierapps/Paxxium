import React, { createContext, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useSocket } from './SocketProvider';
import { useSystemFileManager } from '../hooks/system/useSystemFilesManager';

export const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const { uid } = useContext(AuthContext);
    const { socket } = useSocket();
    const systemFileManager = useSystemFileManager(uid, backendUrl);

    const value = {
        ...systemFileManager,
        socket,
    };

    return (
        <SystemContext.Provider value={value}>
            {children}
        </SystemContext.Provider>
    );
};