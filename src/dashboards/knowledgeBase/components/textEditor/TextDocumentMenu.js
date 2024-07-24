import { useContext,  useState } from 'react';
import { KbContext } from '../../../../contexts/KbContext';
import TextEditor from './TextEditor';
import {
    Button,
    Box,
} from '@mui/material';

const TextDocumentMenu = () => {
    const {
        textEditorManager: {  addNewDoc },
    } = useContext(KbContext);

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);


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
