import { useEffect, useContext, useState, useCallback, useRef } from 'react';
import { Box, Modal, Popper, Paper, Button } from '@mui/material';
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

const FloatingMenu = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    backgroundColor: 'white', // Make sure it's visible
}));

const TextEditor = ({ open, onClose, doc = null }) => {
    const [value, setValue] = useState(doc ? doc.content : '');
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const {
        quill,
        setQuill,
        highlights,
        setHighlights,
        highlightsManager: { handleChunkClick, getRandomColor },
        textEditorManager: { setDocumentDetails },
    } = useContext(KbContext);

    useEffect(() => {
        if (doc) {
            setDocumentDetails(doc);
        }
    }, [doc, setDocumentDetails]);

    const applyHighlights = useCallback(() => {
        console.log('apply highlights');
        if (quill) {
            highlights.forEach(({ start, end, color }) => {
                quill.formatText(start, end - start, { background: color });
            });
        }
    }, [quill, highlights]);

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
                console.log(clickedChunk);
                if (clickedChunk) {
                    console.log('Clicked highlight:', clickedChunk);
                    handleChunkClick(clickedChunk);
                } else {
                    handleChunkClick(null);
                }
            }
            setMenuAnchorEl(null);
        },
        [quill, highlights, handleChunkClick]
    );

    useEffect(() => {
        if (quill) {
            applyHighlights();
            quill.root.addEventListener('click', handleClick);

            return () => {
                quill.root.removeEventListener('click', handleClick);
            };
        }
    }, [quill, applyHighlights, handleClick]);

    const handleHighlight = (range) => {
        if (quill && range && range.length > 0) {
            const color = getRandomColor(highlights.map((h) => h.color));
            quill.formatText(range.index, range.length, { background: color });
            const newHighlight = {
                id: `chunk${highlights.length + 1}`,
                start: range.index,
                end: range.index + range.length,
                color: color,
                text: quill.getText(range.index, range.length),
            };
            setHighlights([...highlights, newHighlight]);
        }
    };

    const handleRemoveHighlight = () => {
        if (quill) {
            const range = quill.getSelection();
            if (range) {
                quill.removeFormat(range.index, range.length);
                setHighlights(
                    highlights.filter(
                        (h) =>
                            h.end <= range.index ||
                            h.start >= range.index + range.length
                    )
                );
            }
        }
        setMenuAnchorEl(null);
    };

    const handleMouseUp = () => {
        if (!quill) return;
        const selection = quill.getSelection();
        if (selection && selection.length > 0) {
            handleHighlight(selection);
        }
        setMenuAnchorEl(null);
    };

    return (
        <Modal open={open} onClose={null}>
            <ModalContent>
                <MainBox>
                    <TextInputUtilityBar onClose={onClose} />
                    <ReactQuill
                        ref={(el) => {
                            if (el) {
                                setQuill(el.getEditor());
                            }
                        }}
                        theme="snow"
                        value={value}
                        onChange={setValue}
                        onChangeSelection={handleMouseUp}
                        modules={{
                            toolbar: false,
                        }}
                    />
                    <Popper
                        open={Boolean(menuAnchorEl)}
                        anchorEl={menuAnchorEl}
                        placement="bottom-start"
                        style={{ zIndex: 9999 }}
                        modifiers={[
                            {
                                name: 'preventOverflow',
                                enabled: true,
                                options: {
                                    altAxis: true,
                                    altBoundary: true,
                                    tether: true,
                                    rootBoundary: 'document',
                                    padding: 8,
                                },
                            },
                        ]}
                    >
                        <FloatingMenu>
                            <Button onClick={handleRemoveHighlight}>
                                Remove Highlight
                            </Button>
                        </FloatingMenu>
                    </Popper>
                </MainBox>
            </ModalContent>
        </Modal>
    );
};

export default TextEditor;
