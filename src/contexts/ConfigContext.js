import React, {
    createContext,
    useState,
    useCallback,
    useContext,
    useRef,
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
    const newCategoryRef = useRef(null);
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
            if (newCategoryRef.current) {
                setCategories((prevCategories) => [
                    ...prevCategories,
                    newCategoryRef.current,
                ]);
                setConfigFiles((prevFiles) => [
                    ...prevFiles,
                    { ...selectedFile, category: newCategoryRef.current },
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
        newCategoryRef,
        categories,
        filesByCategory,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
