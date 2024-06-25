import { useContext, useState } from 'react';
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { ProjectContext } from '../ProjectContext';

const NewProject = () => {
    const {
        projectManager: {
            createProject,
            isNewProjectOpen,
            setIsNewProjectOpen,
        },
    } = useContext(ProjectContext);
    const [name, setName] = useState('');
    const [objective, setObjective] = useState('');

    const handleCreateProject = async (name, objective) => {
        createProject(name, objective).then(() => {
            setName('');
            setObjective('');
        });
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
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Name"
                    type="text"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="objective"
                    label="Please describe your project and your objectives..."
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
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
                    onClick={() => handleCreateProject(name, objective)}
                    color="primary"
                >
                    Create Project
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewProject;
