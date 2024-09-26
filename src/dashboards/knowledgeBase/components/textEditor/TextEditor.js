import { useEffect, useContext, useState, useCallback } from 'react';
import { Modal, DialogActions, Button, Box } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TextInputUtilityBar from './TextInputUtilityBar';
import { KbContext } from '../../../../contexts/KbContext';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';

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

const StyledReactQuill = styled(ReactQuill)(({ muiTheme }) => ({
    flex: 1,
    minHeight: '50%',
    border: 'none',
    '& .ql-container': {
        height: 'auto',
        minHeight: '300px',
        maxHeight: 'calc(90vh - 200px)',
        overflowY: 'auto',
        border: 'none',
    },
}));

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
}) => {
    const theme = useTheme();
    const { quill, setQuill, handleSave, handleEmbed, convertHTMLtoMarkdown } = useContext(KbContext);

    const [changedPages, setChangedPages] = useState({});

    useEffect(() => {
        if (document) {
            setDocumentDetails(document, currentDocIndex);
        }
    }, [document, setDocumentDetails, currentDocIndex]);

    useEffect(() => {
        console.log('changedPages', changedPages);
    }, [changedPages]);

    useEffect(() => {
        if (quill) {
            const handleTextChange = (delta, oldDelta, source) => {
                if (source === 'user') {
                    const content = quill.root.innerHTML;
                    setChangedPages((prev) => ({
                        ...prev,
                        [currentDocIndex]: convertHTMLtoMarkdown(content),
                    }));
                }
            };

            quill.on('text-change', handleTextChange);

            return () => {
                quill.off('text-change', handleTextChange);
            };
        }
    }, [quill, currentDocIndex, convertHTMLtoMarkdown]);

    const handleEditorChange = useCallback(
        (content) => {
            setEditorContent(content);
        },
        [setEditorContent]
    );

    const handleSaveWrapper = () => {
        const pagesToUpdate = Object.entries(changedPages).map(
            ([index, content]) => ({
                index: parseInt(index),
                content: content,
            })
        );

        if (pagesToUpdate.length > 0) {
            handleSave(pagesToUpdate);
            setChangedPages({});
        }
    };

    if (!currentDocIndex && document.content.length) {
        setCurrentDocIndex(document.content.length - 1);
    }

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
                        <StyledReactQuill
                            key={currentDocIndex}
                            ref={(el) => {
                                if (el) {
                                    setQuill(el.getEditor());
                                }
                            }}
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
                                onClick={handleSaveWrapper}
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
