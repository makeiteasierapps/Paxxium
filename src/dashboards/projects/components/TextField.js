import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Box } from '@mui/material';
import TextInputUtilityBar from './TextInputUtilityBar';
import { ProjectContext } from '../ProjectContext';
import { styled } from '@mui/system';

const MainBox = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '70vh',
    border: '1px solid #e0e0e0',
});

const getRandomColor = (usedColors) => {
    const letters = '0123456789ABCDEF';
    let color;
    do {
        color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
    } while (
        usedColors.includes(color) ||
        color === '#FFFFFF' ||
        color === '#000000'
    );
    return color;
};

const saveSelection = (containerEl) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    return {
        start: start,
        end: start + range.toString().length,
    };
};

const restoreSelection = (containerEl, savedSel) => {
    if (!savedSel) return;
    const charIndex = { start: 0, end: 0 };
    const range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    const nodeStack = [containerEl];
    let node,
        foundStart = false,
        stop = false;

    while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType === 3) {
            const nextCharIndex = charIndex.start + node.length;
            if (
                !foundStart &&
                savedSel.start >= charIndex.start &&
                savedSel.start <= nextCharIndex
            ) {
                range.setStart(node, savedSel.start - charIndex.start);
                foundStart = true;
            }
            if (
                foundStart &&
                savedSel.end >= charIndex.start &&
                savedSel.end <= nextCharIndex
            ) {
                range.setEnd(node, savedSel.end - charIndex.start);
                stop = true;
            }
            charIndex.start = nextCharIndex;
        } else {
            let i = node.childNodes.length;
            while (i--) {
                nodeStack.push(node.childNodes[i]);
            }
        }
    }

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

const TextFieldComponent = ({ project }) => {
    const [documentText, setDocumentText] = useState('');
    const [chunks, setChunks] = useState([]);
    const [usedColors, setUsedColors] = useState([]);
    const [selectedChunk, setSelectedChunk] = useState(null);
    const [editingChunk, setEditingChunk] = useState(false);
    const contentEditableRef = useRef(null);

    const { saveTextDoc } = useContext(ProjectContext);

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        if (savedData[project.id]) {
            setDocumentText(savedData[project.id].text || '');
            setChunks(savedData[project.id].chunks || []);
        }
    }, [project.id]);

    const handleSave = async () => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        const existingDoc = savedData[project.id];
        console.log(existingDoc);
        const existingDocId = existingDoc ? existingDoc.docId : null;

        const docId = await saveTextDoc(
            project.id,
            documentText,
            chunks,
            existingDocId
        );

        savedData[project.id] = {
            text: documentText,
            chunks: chunks,
            docId: docId,
        };
        localStorage.setItem('textDocs', JSON.stringify(savedData));
    };

    const updateChunks = (newText, cursorPosition, diff) => {
        return chunks.map((chunk) => {
            if (cursorPosition <= chunk.start) {
                return {
                    ...chunk,
                    start: chunk.start + diff,
                    end: chunk.end + diff,
                };
            } else if (
                cursorPosition > chunk.start &&
                cursorPosition <= chunk.end
            ) {
                return { ...chunk, end: chunk.end + diff };
            }
            return chunk;
        });
    };
    const handleInput = (e) => {
        const newText = e.target.innerText;
        const diff = newText.length - documentText.length;

        if (diff !== 0) {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(contentEditableRef.current);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            const cursorPosition = preSelectionRange.toString().length;

            const updatedChunks = updateChunks(newText, cursorPosition, diff);
            setChunks(updatedChunks);
        }

        setDocumentText(newText);
        applyHighlights();
    };

    const handleMouseUp = () => {
        if (editingChunk) {
            return;
        }

        const selection = window.getSelection();
        const selectedText = selection.toString();
        if (selectedText) {
            const range = selection.getRangeAt(0);
            const preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(contentEditableRef.current);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            const startOffset = preSelectionRange.toString().length;
            const endOffset = startOffset + selectedText.length;

            const isOverlapping = chunks.some(
                (chunk) => startOffset < chunk.end && endOffset > chunk.start
            );

            if (isOverlapping) {
                return;
            }

            const color = getRandomColor(usedColors);
            setUsedColors([...usedColors, color]);
            setChunks([
                ...chunks,
                {
                    id: `chunk${chunks.length + 1}`,
                    text: selectedText,
                    color: color,
                    start: startOffset,
                    end: endOffset,
                },
            ]);
            applyHighlights();
        } else {
            const newText = contentEditableRef.current.innerText;
            const diff = newText.length - documentText.length;
            const cursorPosition = window
                .getSelection()
                .getRangeAt(0).startOffset;

            const updatedChunks = updateChunks(newText, cursorPosition, diff);
            setChunks(updatedChunks);
            setDocumentText(newText);
            applyHighlights();
        }
    };

    const applyHighlights = useCallback(() => {
        const contentEditable = contentEditableRef.current;
        if (!contentEditable) return;

        const savedSelection = saveSelection(contentEditable);

        let lastIndex = 0;
        const elements = [];

        chunks.sort((a, b) => a.start - b.start);

        chunks.forEach((chunk) => {
            const startIndex = chunk.start;
            const endIndex = chunk.end;
            if (startIndex !== -1) {
                if (startIndex > lastIndex) {
                    elements.push(
                        documentText.substring(lastIndex, startIndex)
                    );
                }
                elements.push(
                    `<span style="background-color: ${chunk.color};" data-chunk-id="${chunk.id}">${documentText.substring(startIndex, endIndex)}</span>`
                );
                lastIndex = endIndex;
            }
        });

        if (lastIndex < documentText.length) {
            elements.push(documentText.substring(lastIndex));
        }

        contentEditable.innerHTML = elements.join('');

        // Add click event listeners to chunks
        chunks.forEach((chunk) => {
            const chunkElement = contentEditable.querySelector(
                `[data-chunk-id="${chunk.id}"]`
            );
            if (chunkElement) {
                chunkElement.addEventListener('click', () =>
                    handleChunkClick(chunk)
                );
            }
        });

        restoreSelection(contentEditable, savedSelection);
    }, [chunks, documentText]);

    const handleChunkClick = (chunk) => {
        setSelectedChunk((prevSelectedChunk) => {
            if (prevSelectedChunk?.id === chunk.id) {
                setEditingChunk(false);
                return null;
            }

            setEditingChunk(true);
            return { ...chunk };
        });
    };

    useEffect(() => {
        applyHighlights();
    }, [applyHighlights, chunks]);

    return (
        <MainBox>
            <TextInputUtilityBar
                handleSave={handleSave}
                selectedChunk={selectedChunk}
                setSelectedChunk={setSelectedChunk}
                chunks={chunks}
                setChunks={setChunks}
                usedColors={usedColors}
                setUsedColors={setUsedColors}
                applyHighlights={applyHighlights}
                text={documentText}
            />
            <div
                ref={contentEditableRef}
                contentEditable
                onInput={handleInput}
                onMouseUp={handleMouseUp}
                style={{
                    whiteSpace: 'pre-wrap',
                    padding: '10px 20px',
                    border: '1px solid #e0e0e0',
                    height: '100%',
                    overflowY: 'auto',
                    marginTop: '10px',
                }}
            />
        </MainBox>
    );
};
export default TextFieldComponent;
