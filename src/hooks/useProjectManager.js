import { useState, useContext, useCallback, useEffect } from 'react';
import { SnackbarContext } from '../contexts/SnackbarContext';
import { ChatContext } from '../contexts/ChatContext';
import { AuthContext } from '../contexts/AuthContext';

export const useProjectManager = (backendUrl) => {
    const [projects, setProjects] = useState([]);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const { showSnackbar } = useContext(SnackbarContext);
    const { setChatArray } = useContext(ChatContext);
    const { uid } = useContext(AuthContext);

    const addProject = (project) => {
        setProjects((prevProjects) => {
            return [...prevProjects, project];
        });
    };

    const deleteProject = async (projectId) => {
        try {
            const response = await fetch(`${backendUrl}/projects`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'dbName': process.env.REACT_APP_DB_NAME,
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

    const createProject = async (name, objective) => {
        const formData = JSON.stringify({ name, objective });
        try {
            const create_project_response = await fetch(
                `${backendUrl}/projects`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'uid': uid,
                        'dbName': process.env.REACT_APP_DB_NAME,
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

            setChatArray((prevChats) => {
                const updatedChatArray = [newChatData, ...prevChats];
                return updatedChatArray;
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
                    'uid': uid,
                    'dbName': process.env.REACT_APP_DB_NAME,
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
    }, [backendUrl, showSnackbar, uid]);

    useEffect(() => {
        if (!uid) {
            return;
        }
        fetchProjects();
    }, [fetchProjects, uid]);

    return {
        projects,
        isNewProjectOpen,
        setIsNewProjectOpen,
        createProject,
        deleteProject,
        fetchProjects,
    };
};
