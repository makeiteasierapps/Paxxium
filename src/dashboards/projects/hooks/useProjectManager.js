import { useState, useContext, useCallback } from 'react';
import { SnackbarContext } from '../../../SnackbarContext';
import { AuthContext } from '../../../auth/AuthContext';
import { ChatContext } from '../../agents/chat/ChatContext';

export const useProjectManager = (backendUrl) => {
    const [projects, setProjects] = useState([]);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const { showSnackbar } = useContext(SnackbarContext);
    const { idToken } = useContext(AuthContext);
    const { setChatArray } = useContext(ChatContext);

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

    const createProject = async (name, objective) => {
        const formData = JSON.stringify({ name, objective });
        try {
            const create_project_response = await fetch(
                `${backendUrl}/projects`,
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

    return {
        projects,
        isNewProjectOpen,
        setIsNewProjectOpen,
        createProject,
        deleteProject,
        fetchProjects,
    };
};
