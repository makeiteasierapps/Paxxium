import React, { createContext, useState, useCallback } from 'react';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
    const [configFiles, setConfigFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');

    const fetchConfigFiles = useCallback(async (uid) => {
        try {
            const response = await fetch(`/api/config-files?uid=${uid}`);
            if (!response.ok) {
                throw new Error('Failed to fetch config files');
            }
            const data = await response.json();
            setConfigFiles(data);
        } catch (error) {
            console.error('Error fetching config files:', error);
        }
    }, []);

    const fetchFileContent = useCallback(async (uid, filename) => {
        try {
            const response = await fetch(
                `/api/config-files/${filename}?uid=${uid}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch file content');
            }
            const data = await response.json();
            setFileContent(data.content);
        } catch (error) {
            console.error('Error fetching file content:', error);
        }
    }, []);

    const saveFileContent = useCallback(async (uid, filename, content) => {
        try {
            const response = await fetch(
                `/api/config-files/${filename}?uid=${uid}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content }),
                }
            );
            if (!response.ok) {
                throw new Error('Failed to save file content');
            }
        } catch (error) {
            console.error('Error saving file content:', error);
        }
    }, []);

    const value = {
        configFiles,
        selectedFile,
        fileContent,
        setSelectedFile,
        setFileContent,
        fetchConfigFiles,
        fetchFileContent,
        saveFileContent,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
