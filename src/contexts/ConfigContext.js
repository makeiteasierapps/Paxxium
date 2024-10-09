import React, { createContext, useState, useCallback } from 'react';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
    const [configFiles, setConfigFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const fetchConfigFiles = useCallback(
        async (uid) => {
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
                console.log(data);
                setConfigFiles(data);
            } catch (error) {
                console.error('Error fetching config files:', error);
            }
        },
        [backendUrl]
    );

    const saveFileContent = useCallback(
        async (uid, filename, content) => {
            try {
                const response = await fetch(
                    `${backendUrl}/config-files`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            uid: uid,
                        },
                        body: JSON.stringify({ filename, content }),
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to save file content');
                }
            } catch (error) {
                console.error('Error saving file content:', error);
            }
        },
        [backendUrl]
    );

    const value = {
        configFiles,
        selectedFile,
        fileContent,
        setSelectedFile,
        setFileContent,
        fetchConfigFiles,
        saveFileContent,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
