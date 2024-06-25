import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from '../ProjectContext';
import TextEditor from './TextEditor';
import {
    Button,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from '@mui/material';

const TextDocumentMenu = ({ project }) => {
    const {
        documentManager: { textDocArray, fetchData },
    } = useContext(ProjectContext);

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => {
        fetchData(project);
    }, []);

    const handleNewDocument = () => {
        console.log('New Document button clicked');
    };

    const handleDocumentClick = (document) => {
        setIsEditorOpen(true);
        setSelectedDocument(document);
    };

    return (
        <Box>
            <Button variant="outlined" onClick={handleNewDocument}>
                New Document
            </Button>
            <List>
                {textDocArray.map((document) => (
                    <ListItem key={document.id} disablePadding>
                        <ListItemButton
                            onClick={() => handleDocumentClick(document)}
                        >
                            <ListItemText primary={document.id} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {isEditorOpen && <TextEditor document={selectedDocument} />}
        </Box>
    );
};

export default TextDocumentMenu;
