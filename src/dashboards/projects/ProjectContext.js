import {
    useState,
    createContext,
    useContext,
    useEffect,
    useCallback,
} from 'react';

import { AuthContext } from '../../auth/AuthContext';
import { SnackbarContext } from '../../SnackbarContext';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [isWebScrapeOpen, setIsWebScrapeOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const { idToken } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);

    const [projects, setProjects] = useState([]);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:50006'
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const addProject = (project) => {
        setProjects((prevProjects) => {
            return [...prevProjects, project];
        });
    };

    const fetchProjects = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/projects`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const data = await response.json();
            setProjects(data.projects);
        } catch (error) {
            showSnackbar('Error fetching projects', 'error');
        }
    }, [backendUrl, idToken, showSnackbar]);

    useEffect(() => {
        if (!idToken) return;
        fetchProjects();
    }, [idToken]);

    return (
        <ProjectContext.Provider
            value={{
                projects,
                fetchProjects,
                isWebScrapeOpen,
                isNewProjectOpen,
                setIsWebScrapeOpen,
                setIsNewProjectOpen,
                isChatOpen,
                setIsChatOpen,
                addProject,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};
