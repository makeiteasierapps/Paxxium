import { useState, useCallback, useEffect } from 'react';
export const useSystemFileManager = (uid, backendUrl, showSnackbar) => {
    const [configFiles, setConfigFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [filesByCategory, setFilesByCategory] = useState({});
    const [systemHealth, setSystemHealth] = useState({});

    const getFileNames = (category) => {
        return filesByCategory[category]?.map((file) =>
            file.path.split('/').pop()
        );
    };

    useEffect(() => {
        const newFilesByCategory = configFiles.reduce((acc, file) => {
            if (!acc[file.category]) acc[file.category] = [];
            acc[file.category].push(file);
            return acc;
        }, {});
        setFilesByCategory(newFilesByCategory);
    }, [configFiles]);

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
            setCategories([...new Set(data.map((file) => file.category))]);
            setConfigFiles(data);
        } catch (error) {
            console.error('Error fetching config files:', error);
            showSnackbar('Error fetching config files', 'error');
        }
    }, [uid, backendUrl, showSnackbar]);

    const checkSystemHealth = useCallback(async () => {
        if (!uid) {
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/system-health`, {
                method: 'GET',
                headers: {
                    uid: uid,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch config files');
            }
            const data = await response.json();
            setSystemHealth(data);
        } catch (error) {
            console.error('Error checking system health:', error);
            showSnackbar('Error checking system health', 'error');
        }
    }, [uid, backendUrl, showSnackbar]);

    const updateFileCommands = async (
        restartCommand = null,
        testCommand = null
    ) => {
        if (!selectedFile) {
            return;
        }
        const updatedFile = { ...selectedFile };
        if (restartCommand) updatedFile.restart_command = restartCommand;
        if (testCommand) updatedFile.test_command = testCommand;
        try {
            const response = await fetch(`${backendUrl}/file-commands`, {
                method: 'PUT',
                body: JSON.stringify(updatedFile),
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to update file commands');
            }

            showSnackbar('File commands updated successfully', 'success');
            setSelectedFile(updatedFile);
        } catch (error) {
            console.error('Error updating file commands:', error);
            showSnackbar('Error updating file commands', 'error');
        }
    };

    const saveFileContent = async () => {
        try {
            const response = await fetch(`${backendUrl}/config-files`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                },
                body: JSON.stringify(selectedFile),
            });
            if (!response.ok) {
                throw new Error('Failed to save file content');
            }

            setConfigFiles((prevFiles) => {
                const fileIndex = prevFiles.findIndex(
                    (file) => file.path === selectedFile.path
                );
                if (fileIndex !== -1) {
                    // Update existing file
                    const updatedFiles = [...prevFiles];
                    updatedFiles[fileIndex] = { ...selectedFile };
                    return updatedFiles;
                } else {
                    // Add new file
                    return [...prevFiles, { ...selectedFile }];
                }
            });

            if (
                selectedFile.category &&
                !categories.includes(selectedFile.category)
            ) {
                setCategories((prevCategories) => [
                    ...prevCategories,
                    selectedFile.category,
                ]);
            }

            showSnackbar('File saved successfully', 'success');
        } catch (error) {
            console.error('Error saving file content:', error);
            showSnackbar('Error saving file content', 'error');
        }
    };

    const createFile = async (file) => {
        try {
            const response = await fetch(`${backendUrl}/config-files`, {
                method: 'POST',
                body: JSON.stringify(file),
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to create file');
            }
            const data = await response.json();
            setConfigFiles((prevFiles) => [...prevFiles, data]);
            showSnackbar('File created successfully', 'success');
        } catch (error) {
            console.error('Error creating file:', error);
            showSnackbar('Error creating file', 'error');
        }
    };

    return {
        configFiles,
        createFile,
        selectedFile,
        setSelectedFile,
        fetchConfigFiles,
        saveFileContent,
        categories,
        filesByCategory,
        checkSystemHealth,
        getFileNames,
        systemHealth,
        updateFileCommands,
    };
};
