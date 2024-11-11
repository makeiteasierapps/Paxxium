import React, { createContext, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useSocket } from './SocketProvider';
import { useSystemFileManager } from '../hooks/system/useSystemFilesManager';
import { useSystemAgent } from '../hooks/system/useSystemAgent';
import { useSnackbar } from './SnackbarContext';
export const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const { showSnackbar } = useSnackbar();
    const { uid } = useContext(AuthContext);
    const { socket } = useSocket();
    const systemFileManager = useSystemFileManager(
        uid,
        backendUrl,
        showSnackbar
    );
    const systemAgent = useSystemAgent(uid, socket, showSnackbar);

    const value = {
        showSnackbar,
        ...systemFileManager,
        ...systemAgent,
        socket,
    };

    return (
        <SystemContext.Provider value={value}>
            {children}
        </SystemContext.Provider>
    );
};
