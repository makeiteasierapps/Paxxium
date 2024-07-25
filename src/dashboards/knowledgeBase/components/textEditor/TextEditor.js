import { useEffect, useContext } from 'react';
import { Box, Modal } from '@mui/material';
import TextInputUtilityBar from './TextInputUtilityBar';
import { KbContext } from '../../../../contexts/KbContext';
import { styled } from '@mui/system';

const ModalContent = styled(Box)({
    backgroundColor: 'black',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
    zIndex: 9999,
});

const MainBox = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '80vh',
});

const StyledTextEditor = styled(Box)({
    whiteSpace: 'pre-wrap',
    padding: '10px 20px',
    border: '1px solid #e0e0e0',
    height: 'calc(100% - 50px)',
    overflowY: 'auto',
    marginTop: '10px',
});

const TextEditor = ({ open, onClose, doc = null }) => {
    const {
        highlightsManager: { contentEditableRef, handleInput, handleMouseUp },
        textEditorManager: { setDocumentDetails },
    } = useContext(KbContext);

    useEffect(() => {
        if (doc) {
            setDocumentDetails(doc);
        }
    }, [doc, setDocumentDetails]);

    useEffect(() => {
        const contentEditable = contentEditableRef.current;
        if (contentEditable) {
            contentEditable.addEventListener('input', handleInput);
            contentEditable.addEventListener('mouseup', handleMouseUp);

            // Cleanup function to remove event listeners
            return () => {
                contentEditable.removeEventListener('input', handleInput);
                contentEditable.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [contentEditableRef, handleInput, handleMouseUp]);

    return (
        <Modal open={open} onClose={onClose} fullScreen>
            <ModalContent>
                <MainBox>
                    <TextInputUtilityBar onClose={onClose} />
                    <StyledTextEditor
                        ref={contentEditableRef}
                        contentEditable
                        onInput={handleInput}
                        onMouseUp={handleMouseUp}
                    />
                </MainBox>
            </ModalContent>
        </Modal>
    );
};

export default TextEditor;
