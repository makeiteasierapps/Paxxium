import { useState, useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import TextInputUtilityBar from './TextInputUtilityBar';
import { styled } from '@mui/system';
import { getEncoding } from 'js-tiktoken';

const encoding = getEncoding('cl100k_base');

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
    const [text, setText] = useState('');
    const [chunks, setChunks] = useState([]);
    const [usedColors, setUsedColors] = useState([]);
    const [selectedChunk, setSelectedChunk] = useState(null);
    const [editingChunk, setEditingChunk] = useState(false);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const contentEditableRef = useRef(null);

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        setText(savedData[project.id] || '');
    }, [project.id]);

    const handleSave = () => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        savedData[project.id] = text;
        localStorage.setItem('textDocs', JSON.stringify(savedData));
    };

    const handleInput = (e) => {
        setText(e.target.innerText);
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
        }
    };

    const applyHighlights = useCallback(() => {
        const contentEditable = contentEditableRef.current;
        if (!contentEditable) return;

        const savedSelection = saveSelection(contentEditable);

        let lastIndex = 0;
        const elements = [];

        chunks.sort((a, b) => a.start - b.start); // Ensure chunks are sorted by start position

        chunks.forEach((chunk) => {
            const startIndex = chunk.start;
            const endIndex = chunk.end;
            if (startIndex !== -1) {
                if (startIndex > lastIndex) {
                    elements.push(text.substring(lastIndex, startIndex));
                }
                elements.push(
                    `<span style="background-color: ${chunk.color};" data-chunk-id="${chunk.id}">${text.substring(startIndex, endIndex)}</span>`
                );
                lastIndex = endIndex;
            }
        });

        if (lastIndex < text.length) {
            elements.push(text.substring(lastIndex));
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
    }, [chunks, text]);

    const handleChunkClick = (chunk) => {
        setSelectedChunk((prevSelectedChunk) => {
            if (prevSelectedChunk?.id === chunk.id) {
                setEditingChunk(false);
                return null;
            }

            setEditingChunk(true);
            setStart(chunk.start);
            setEnd(chunk.end);
            return chunk;
        });
    };

    useEffect(() => {
        applyHighlights();
    }, [applyHighlights, chunks]);

    return (
        <MainBox>
            <TextInputUtilityBar
                TokenCount={encoding.encode(text).length}
                handleSave={handleSave}
                selectedChunk={selectedChunk}
                setSelectedChunk={setSelectedChunk}
                chunks={chunks}
                setChunks={setChunks}
                usedColors={usedColors}
                setUsedColors={setUsedColors}
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
                applyHighlights={applyHighlights}
                text={text}
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
