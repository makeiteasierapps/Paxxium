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

    useEffect(() => {
        if (doc && currentUrlIndex !== null) {
            setDocumentDetails(doc, currentUrlIndex);
            const content = Array.isArray(doc.content)
                ? doc.content[currentUrlIndex].content
                : doc.content;
            setEditorContent(content);
        }
    }, [doc, setDocumentDetails, currentUrlIndex, setEditorContent]);

    useEffect(() => {
        console.log(changedPages);
    }, [changedPages]);

    const hasContentChanged = useCallback(
        (index, newContent) => {
            if (
                index === null ||
                index === undefined ||
                !doc ||
                !doc.content ||
                !doc.content[index]
            ) {
                console.error(
                    'Invalid index or document structure:',
                    index,
                    doc
                );
                return false;
            }
            const originalContent = doc.content[index].content;
            const differences = diffWords(originalContent, newContent);
            return differences.some((part) => part.added || part.removed);
        },
        [doc]
    );

    const handleEditorChange = (content) => {
        setEditorContent(content);
        const markdownContent = turndownService.turndown(content);

        if (
            currentUrlIndex !== null &&
            hasContentChanged(currentUrlIndex, markdownContent)
        ) {
            setChangedPages((prev) => ({
                ...prev,
                [currentUrlIndex]: markdownContent,
            }));
        } else if (currentUrlIndex !== null) {
            setChangedPages((prev) => {
                const newChangedPages = { ...prev };
                delete newChangedPages[currentUrlIndex];
                return newChangedPages;
            });
        }
    };

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
