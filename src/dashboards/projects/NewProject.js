import { useContext, useState } from 'react';
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { AuthContext } from '../../auth/AuthContext';
import { ProjectContext } from './ProjectContext';

const NewProject = () => {
    const { idToken } = useContext(AuthContext);
    const { addProject, isNewProjectOpen, setIsNewProjectOpen } =
        useContext(ProjectContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleCreateProject = async (name, description) => {
        const formData = JSON.stringify({ name, description });
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

        // I am not sure why I am making a separate call to the server.
        // I should be able to create the chat on the server when I create the project.
        // I will fix this later.
        const creat_chat_response = await fetch(
            'http://localhost:50001/chat/create',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify({
                    chatName: newProject.name,
                    agentModel: 'GPT-4',
                    systemPrompt: '',
                    chatConstants: '',
                    useProfileData: false,
                    projectId: newProject.id,
                }),
            }
        );

        if (!creat_chat_response.ok) {
            throw new Error('Failed to create project chat');
        }

        setIsNewProjectOpen(false);
        setName('');
        setDescription('');
        addProject(newProject);
    };

    return (
        <Dialog
            gap={2}
            open={isNewProjectOpen}
            onClose={() => setIsNewProjectOpen(false)}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                Create a New Project
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To create a new project, please enter the project name and
                    description here.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Project Name"
                    type="text"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="description"
                    label="Project Description"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setIsNewProjectOpen(false)}
                    color="primary"
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => handleCreateProject(name, description)}
                    color="primary"
                >
                    Create Project
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewProject;
