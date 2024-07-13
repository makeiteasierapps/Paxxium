import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from '../../../../contexts/ProjectContext';
import TextEditor from './TextEditor';
import {
    Button,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from '@mui/material';

const TextDocumentMenu = () => {
    const {
        documentManager: { textDocArray, fetchData, addNewDoc },
    } = useContext(ProjectContext);

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const handleNewDocument = () => {
        addNewDoc();
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
            {isEditorOpen && (
                <TextEditor
                    key={selectedDocument.id}
                    document={selectedDocument}
                />
            )}
        </Box>
    );
};

export default TextDocumentMenu;
