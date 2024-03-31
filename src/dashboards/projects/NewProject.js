import { useContext, useState } from 'react'; // Import useState
import {
    Box,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { SettingsMenuButton } from '../agents/agentStyledComponents';
import { styled } from '@mui/system';
import { AuthContext } from '../../auth/AuthContext';

const NewProject = ({ isOpen, onClose }) => {
    const { idToken } = useContext(AuthContext);
    const [name, setName] = useState(''); // State for project name
    const [description, setDescription] = useState(''); // State for project description

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
        console.log(data);

        const creat_chat_response = await fetch(
            'http://localhost:50001/chat/create',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify({
                    chatName: data.project_name,
                    agentModel: 'GPT-4',
                    systemPrompt: '',
                    chatConstants: '',
                    useProfileData: false,
                    projectId: data.project_id,
                }),
            }
        );

        if (!creat_chat_response.ok) {
            throw new Error('Failed to create project chat');
        }
        setName('');
        setDescription('');

        // add the new project to state
    };

    console.log(isOpen);
    return (
        <Dialog
            gap={2}
            open={isOpen}
            onClose={onClose}
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
                <Button onClick={onClose} color="primary">
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
