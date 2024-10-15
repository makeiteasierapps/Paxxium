import React, {
    createContext,
    useState,
    useCallback,
    useContext,
    useEffect,
} from 'react';
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
    const [categories, setCategories] = useState([]);
    const [filesByCategory, setFilesByCategory] = useState({});

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

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

    const saveFileContent = async () => {
        try {
            const response = await fetch(`${backendUrl}/config-files`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                },
                body: JSON.stringify({
                    path: selectedFile.path,
                    content: selectedFile.content,
                    category: selectedFile.category,
                }),
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

    const value = {
        configFiles,
        selectedFile,
        setSelectedFile,
        fetchConfigFiles,
        saveFileContent,
        showSnackbar,
        socket,
        categories,
        filesByCategory,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
