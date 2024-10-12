import React, { createContext, useState, useCallback, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useSnackbar } from './SnackbarContext';
export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
    const { uid } = useContext(AuthContext);
    const { showSnackbar } = useSnackbar();
    const [configFiles, setConfigFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');

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

    const checkFileExists = async (filename) => {
        try {
            const response = await fetch(`${backendUrl}/config-files/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                },
                body: JSON.stringify({ filename }),
            });
            if (!response.ok) {
                throw new Error('Failed to check if file exists');
            }
            const data = await response.json();
            if (data.exists) {
                console.log(data.content);
            }
        } catch (error) {
            console.error('Error checking if file exists:', error);
            showSnackbar('Error checking if file exists', 'error');
        }
    };

    const value = {
        configFiles,
        selectedFile,
        fileContent,
        setSelectedFile,
        setFileContent,
        fetchConfigFiles,
        saveFileContent,
        checkFileExists,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
