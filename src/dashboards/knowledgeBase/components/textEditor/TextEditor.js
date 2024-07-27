import { useEffect, useContext, useCallback } from 'react';
import { Box, Modal } from '@mui/material';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import TextInputUtilityBar from './TextInputUtilityBar';
import { KbContext } from '../../../../contexts/KbContext';
import { styled } from '@mui/system';

const ModalContent = styled(Box)({
    backgroundColor: 'black',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxHeight: '80vh',
    overflow: 'auto',
});

const MainBox = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
});

const TextEditor = ({ open, onClose, doc = null }) => {

    const {
        quill,
        setQuill,
        highlights,
        setHighlights,
        editorContent,
        setEditorContent,
        highlightsManager: {
            handleChunkClick,
            applyHighlights,
            handleHighlight,
        },
        textEditorManager: { setDocumentDetails },
    } = useContext(KbContext);

    const handleClick = useCallback(
        (event) => {
            if (!quill) return;
            const selection = quill.getSelection();
            if (selection) {
                const clickedIndex = selection.index;
                const clickedChunk = highlights.find(
                    (chunk) =>
                        clickedIndex >= chunk.start && clickedIndex < chunk.end
                );
                if (clickedChunk) {
                    handleChunkClick(clickedChunk);
                } else {
                    handleChunkClick(null);
                }
            }
        },
        [quill, highlights, handleChunkClick]
    );

    useEffect(() => {
        if (doc) {
            setDocumentDetails(doc);
        }
    }, [doc, setDocumentDetails]);

    useEffect(() => {
        if (quill) {
            applyHighlights();
            quill.root.addEventListener('click', handleClick);

            return () => {
                quill.root.removeEventListener('click', handleClick);
            };
        }
    }, [quill, applyHighlights, handleClick]);

    const handleMouseUp = () => {
        if (!quill) return;
        const selection = quill.getSelection();
        if (selection && selection.length > 0) {
            handleHighlight(selection);
        }
    };
    
    return (
        <Modal open={open} onClose={null}>
            <ModalContent>
                <MainBox>
                    <TextInputUtilityBar
                        onClose={onClose}
                        setHighlights={setHighlights}
                    />
                    <ReactQuill
                        ref={(el) => {
                            if (el) {
                                setQuill(el.getEditor());
                            }
                        }}
                        theme="snow"
                        value={editorContent}
                        onChange={setEditorContent}
                        onChangeSelection={handleMouseUp}
                        modules={{
                            toolbar: false,
                        }}
                    />
                </MainBox>
            </ModalContent>
        </Modal>
    );
};

export default TextEditor;
