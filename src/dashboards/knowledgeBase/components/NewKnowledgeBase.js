import { useContext, useState } from 'react';
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { KbContext } from '../../../contexts/KbContext';

const NewKnowledgeBase = () => {
    const { createKnowledgeBase, isNewKbOpen, setIsNewKbOpen } =
        useContext(KbContext);
    const [name, setName] = useState('');
    const [objective, setObjective] = useState('');

    const handleCreateKnowledgeBase = async (name, objective) => {
        createKnowledgeBase(name, objective).then(() => {
            setName('');
            setObjective('');
        });
    };

    return (
        <Dialog
            gap={2}
            open={isNewKbOpen}
            onClose={() => setIsNewKbOpen(false)}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                Create a New Knowledge Base
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
                    label="Please describe your Knowledge Base and your objectives..."
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsNewKbOpen(false)} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={() => handleCreateKnowledgeBase(name, objective)}
                    color="primary"
                >
                    Create Knowledge Base
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewKnowledgeBase;
