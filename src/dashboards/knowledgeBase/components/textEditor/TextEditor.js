import { useEffect, useContext, useState, useCallback } from 'react';
import { Modal, DialogActions, Button, Box } from '@mui/material';
import TurndownService from 'turndown';
import { diffWords } from 'diff';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TextInputUtilityBar from './TextInputUtilityBar';
import { KbContext } from '../../../../contexts/KbContext';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { isEqual } from 'lodash';

const turndownService = new TurndownService();

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
    open,
    onClose,
    urls,
    currentUrlIndex = null,
    setCurrentUrlIndex = null,
    doc = null,
    source = null,
}) => {
    const theme = useTheme();
    const {
        setQuill,
        editorContent,
        setEditorContent,
        handleSave,
        handleEmbed,
        textEditorManager: { setDocumentDetails },
    } = useContext(KbContext);

    const [changedPages, setChangedPages] = useState({});
    const [originalContents, setOriginalContents] = useState({});

    useEffect(() => {
        if (doc && currentUrlIndex !== null) {
            setDocumentDetails(doc, currentUrlIndex);

            // Only set original content if it doesn't exist for this page
            setOriginalContents((prev) => {
                if (!prev.hasOwnProperty(currentUrlIndex)) {
                    return { ...prev, [currentUrlIndex]: editorContent };
                }
                return prev;
            });
        }
    }, [doc, setDocumentDetails, currentUrlIndex]);

    useEffect(() => {
        console.log('changedPages', changedPages);
    }, [changedPages]);

    const hasContentChanged = useCallback((originalContent, newContent) => {
        if (originalContent) {
            return originalContent !== newContent;
        }
        return false;
    }, []);

    const handleEditorChange = useCallback(
        (content) => {
            setEditorContent(content);

            if (currentUrlIndex !== null) {
                const originalContent = originalContents[currentUrlIndex];
                const hasChanged = hasContentChanged(originalContent, content);

                setChangedPages((prev) => {
                    if (hasChanged) {
                        return { ...prev, [currentUrlIndex]: content };
                    } else {
                        const newChangedPages = { ...prev };
                        delete newChangedPages[currentUrlIndex];
                        return newChangedPages;
                    }
                });
            }
        },
        [currentUrlIndex, originalContents, hasContentChanged, setEditorContent]
    );

    const handleSaveWrapper = () => {
        const pagesToUpdate = Object.entries(changedPages).map(
            ([index, content]) => ({
                index: parseInt(index),
                content,
            })
        );

        if (pagesToUpdate.length > 0) {
            handleSave(pagesToUpdate);
            setChangedPages({});
        }
    };

    if (!currentUrlIndex && urls) {
        currentUrlIndex = urls.length - 1;
    }

    useEffect(() => {
        if (doc) {
            setDocumentDetails(doc, currentUrlIndex);
        }
    }, [doc, setDocumentDetails, currentUrlIndex]);

    return (
        <Modal open={open} onClose={onClose}>
            <ModalOverlay>
                <ModalContent>
                    <TextInputUtilityBar
                        onClose={onClose}
                        currentUrlIndex={currentUrlIndex}
                        setCurrentUrlIndex={setCurrentUrlIndex}
                        urls={urls}
                        source={source}
                    />
                    <EditorContainer>
                        <StyledReactQuill
                            key={currentUrlIndex}
                            ref={(el) => {
                                if (el) {
                                    setQuill(el.getEditor());
                                }
                            }}
                            muiTheme={theme}
                            theme="snow"
                            value={editorContent}
                            onChange={(content) =>
                                handleEditorChange(content, editorContent)
                            }
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
                                onClick={() => handleEmbed(currentUrlIndex)}
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
