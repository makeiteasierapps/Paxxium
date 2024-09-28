import { useEffect, useContext, useState, useCallback, useRef } from 'react';
import { Modal, DialogActions, Button, Box } from '@mui/material';
import 'react-quill/dist/quill.snow.css';
import TextInputUtilityBar from './TextInputUtilityBar';
import { KbContext } from '../../../../contexts/KbContext';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { QuillWrapper } from './QuillWrapper';
const ModalOverlay = styled('div')(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const ModalContent = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    boxShadow: `0px 0px 6px 2px ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    width: '80%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    minHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
}));

const EditorContainer = styled('div')({
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
});

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const TextEditor = ({
    document,
    setDocumentDetails,
    currentDocIndex,
    setCurrentDocIndex,
    setEditorContent,
    isEditorOpen,
    toggleEditor,
    editorContent,
    convertHTMLtoMarkdown,
}) => {
    const theme = useTheme();
    const quillRef = useRef(null);
    const [changedPages, setChangedPages] = useState({});
    const { handleSave, handleEmbed, updateDocumentState } =
        useContext(KbContext);

    useEffect(() => {
        if (document) {
            setDocumentDetails(document);
        }
    }, [document, setDocumentDetails]);

    useEffect(() => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const handleTextChange = (delta, oldDelta, source) => {
                if (source === 'user') {
                    const content = quill.root.innerHTML;
                    const source =
                        document.content[currentDocIndex].metadata.sourceURL;

                    setChangedPages((prevChangedPages) => {
                        const updatedDocumentsToChange = [
                            ...(prevChangedPages.documentsToChange || []),
                        ];
                        const existingDocIndex =
                            updatedDocumentsToChange.findIndex(
                                (doc) => doc.source === source
                            );

                        if (existingDocIndex !== -1) {
                            // Update existing document
                            updatedDocumentsToChange[existingDocIndex] = {
                                ...updatedDocumentsToChange[existingDocIndex],
                                content: convertHTMLtoMarkdown(content),
                            };
                        } else {
                            // Add new document
                            updatedDocumentsToChange.push({
                                content: convertHTMLtoMarkdown(content),
                                source,
                            });
                        }

                        const newChangedPages = {
                            kbId: document.kb_id,
                            id: document.id,
                            documentsToChange: updatedDocumentsToChange,
                        };

                        updateDocumentState(newChangedPages);
                        return newChangedPages;
                    });
                }
            };

            quill.on('text-change', handleTextChange);

            return () => {
                quill.off('text-change', handleTextChange);
            };
        }
    }, [
        currentDocIndex,
        convertHTMLtoMarkdown,
        document.content,
        document.id,
        document.kb_id,
        updateDocumentState,
    ]);
    const handleEditorChange = useCallback(
        (content) => {
            setEditorContent(content);
        },
        [setEditorContent]
    );

    return (
        <Modal open={isEditorOpen} onClose={toggleEditor}>
            <ModalOverlay>
                <ModalContent>
                    <TextInputUtilityBar
                        document={document}
                        onClose={toggleEditor}
                        currentDocIndex={currentDocIndex}
                        setCurrentDocIndex={setCurrentDocIndex}
                    />
                    <EditorContainer>
                        <QuillWrapper
                            key={currentDocIndex}
                            ref={quillRef}
                            muiTheme={theme}
                            theme="snow"
                            value={editorContent}
                            onChange={handleEditorChange}
                            modules={{
                                toolbar: false,
                            }}
                        />
                    </EditorContainer>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 2,
                        }}
                    >
                        <StyledDialogActions sx={{ padding: 0 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleSave(changedPages)}
                                disabled={
                                    Object.keys(changedPages).length === 0
                                }
                            >
                                Save
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleEmbed(currentDocIndex)}
                            >
                                Embed
                            </Button>
                        </StyledDialogActions>
                    </Box>
                </ModalContent>
            </ModalOverlay>
        </Modal>
    );
};

export default TextEditor;
