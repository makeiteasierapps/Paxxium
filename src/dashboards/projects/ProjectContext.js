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
    const [documentArray, setDocumentArray] = useState({});
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

    const fetchDocuments = useCallback(
        async (projectId) => {
            try {
                const response = await fetch(
                    `${backendUrl}/projects/documents`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: idToken,
                            'Project-ID': projectId,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch documents');
                }

                const data = await response.json();
                setDocumentArray((prevDocuments) => ({
                    ...prevDocuments,
                    [projectId]: data.documents,
                }));
            } catch (error) {
                showSnackbar('Error fetching documents', 'error');
            }
        },
        [backendUrl, idToken, showSnackbar]
    );

    const deleteDocument = async (projectId, docId) => {
        try {
            const response = await fetch(
                `${backendUrl}/projects/documents/delete`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: idToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ docId }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            setDocumentArray((prevDocs) => {
                const updatedProjectDocs = prevDocs[projectId].filter(
                    (doc) => doc.id !== docId
                );
                return {
                    ...prevDocs,
                    [projectId]: updatedProjectDocs,
                };
            });
        } catch (error) {
            showSnackbar('Error deleting document', 'error');
        }
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
                documentArray,
                fetchDocuments,
                deleteDocument,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};
