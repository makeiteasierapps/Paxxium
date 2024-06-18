import {
    useState,
    createContext,
    useContext,
    useEffect,
    useCallback,
} from 'react';

import { AuthContext } from '../../auth/AuthContext';
import { ChatContext } from '../agents/chat/ChatContext';
import { SnackbarContext } from '../../SnackbarContext';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [documentArray, setDocumentArray] = useState({});
    const { idToken } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);
    const { setAgentArray } = useContext(ChatContext);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:50006'
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const addProject = (project) => {
        setProjects((prevProjects) => {
            return [...prevProjects, project];
        });
    };

    const deleteProject = async (projectId) => {
        try {
            const response = await fetch(`${backendUrl}/projects/delete`, {
                method: 'DELETE',
                headers: {
                    Authorization: idToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectId }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }

            setProjects((prevProjects) => {
                return prevProjects.filter(
                    (project) => project.id !== projectId
                );
            });
        } catch (error) {
            showSnackbar('Error deleting project', 'error');
        }
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

    const addDoc = (projectId, doc) => {
        setDocumentArray((prevDocs) => {
            return {
                ...prevDocs,
                [projectId]: [...prevDocs[projectId], doc],
            };
        });
    };

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

    const createProject = async (name, objective) => {
        const formData = JSON.stringify({ name, objective });
        try {
            const create_project_response = await fetch(
                'http://localhost:50006/projects/create',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: idToken,
                    },
                    body: formData,
                }
            );

            if (!create_project_response.ok) {
                throw new Error('Failed to create project');
            }
            const data = await create_project_response.json();
            const newProject = data.new_project;
            const newChatData = data.new_chat;

            setAgentArray((prevAgents) => {
                const updatedAgentArray = [newChatData, ...prevAgents];
                return updatedAgentArray;
            });
            addProject(newProject);
            setIsNewProjectOpen(false);
        } catch (error) {
            showSnackbar('Error creating project', 'error');
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

    const scrapeUrls = async (
        projectId,
        projectName,
        formattedUrls,
        crawlEntireSite
    ) => {
        const response = await fetch('http://localhost:50006/projects/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify({
                urls: formattedUrls,
                projectName,
                projectId,
                crawlEntireSite,
            }),
        });

        if (!response.ok) throw new Error('Failed to scrape url');

        const data = await response.json();
        const docs = data.docs;
        docs.forEach((doc) => {
            addDoc(projectId, doc);
        });
    };

    const saveTextDoc = async (projectId, text, chunks, docId) => {
        try {
            const response = await fetch(
                'http://localhost:50006/projects/save_text_doc',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: idToken,
                    },
                    body: JSON.stringify({ projectId, text, chunks, docId }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to save text doc');
            }

            const data = await response.json();
            console.log(data);
            return data.docId;
        } catch (error) {
            console.error(error);
            showSnackbar('Error saving text doc', 'error');
        }
    };

    useEffect(() => {
        if (!idToken) return;
        fetchProjects();
    }, [fetchProjects, idToken]);

    return (
        <ProjectContext.Provider
            value={{
                projects,
                fetchProjects,
                deleteProject,
                isNewProjectOpen,
                setIsNewProjectOpen,
                createProject,
                documentArray,
                fetchDocuments,
                deleteDocument,
                scrapeUrls,
                saveTextDoc,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};
