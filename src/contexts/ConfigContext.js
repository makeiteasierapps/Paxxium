import React, { createContext, useState, useCallback, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useSnackbar } from './SnackbarContext';
import { useSocket } from './SocketProvider';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
    const { uid } = useContext(AuthContext);
    const { socket } = useSocket();
    const { showSnackbar } = useSnackbar();
    const [configFiles, setConfigFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const fetchConfigFiles = useCallback(async () => {
        if (!uid) {
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/config-files`, {
                method: 'GET',
                headers: {
                    uid: uid,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch config files');
            }
            const data = await response.json();
            setConfigFiles(data);
        } catch (error) {
            console.error('Error fetching config files:', error);
            showSnackbar('Error fetching config files', 'error');
        }
    }, [uid, backendUrl, showSnackbar]);

    const saveFileContent = async (filename, content, category) => {
        try {
            const response = await fetch(`${backendUrl}/config-files`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                },
                body: JSON.stringify({ filename, content, category }),
            });
            if (!response.ok) {
                throw new Error('Failed to save file content');
            }
            showSnackbar('File saved successfully', 'success');
        } catch (error) {
            console.error('Error saving file content:', error);
            showSnackbar('Error saving file content', 'error');
        }
    };

    const value = {
        configFiles,
        selectedFile,
        setSelectedFile,
        fetchConfigFiles,
        saveFileContent,
        showSnackbar,
        socket,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
