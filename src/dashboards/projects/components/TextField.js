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
    const [highlights, setHighlights] = useState([]);
    const [usedColors, setUsedColors] = useState([]);
    const [selectedChunk, setSelectedChunk] = useState(null);
    const [category, setCategory] = useState(null);
    const [docId, setDocId] = useState(null);

    const [editingChunk, setEditingChunk] = useState(false);
    const contentEditableRef = useRef(null);

    const { saveTextDoc, embedTextDoc, getTextDoc } =
        useContext(ProjectContext);

    useEffect(() => {
        console.log(docId);
        const fetchData = async () => {
            const savedData =
                JSON.parse(localStorage.getItem('textDocs')) || {};
            if (savedData[project.id]) {
                setDocumentText(savedData[project.id].content || '');
                setHighlights(savedData[project.id].highlights || []);
            } else {
                const doc = await getTextDoc(project.id);
                setDocumentText(doc.content || '');
                setHighlights(doc.highlights || []);
                setCategory(doc.category || '');

                const newTextDocs = {
                    [project.id]: {
                        content: doc.content || '',
                        highlights: doc.highlights || [],
                        category: doc.category || '',
                        docId: doc.docId || null,
                    },
                };
                localStorage.setItem('textDocs', JSON.stringify(newTextDocs));
            }
        };

        fetchData();
    }, [project.id]);

    const handleSave = async () => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        const existingDoc = savedData[project.id];
        const existingDocId = existingDoc ? existingDoc.docId : null;

        const docId = await saveTextDoc(
            project.id,
            category,
            documentText,
            highlights,
            existingDocId
        );

        savedData[project.id] = {
            content: documentText,
            category: category,
            highlights: highlights,
            docId: docId,
        };
        setDocId(docId);
        localStorage.setItem('textDocs', JSON.stringify(savedData));
        return docId;
    };

    const handleEmbed = async () => {
        let currentDocId = docId;
        if (!currentDocId) {
            currentDocId = await handleSave();
        }
        console.log(currentDocId);
        await embedTextDoc(
            currentDocId,
            project.id,
            documentText,
            highlights,
            category
        );
    };

    const updateHighlights = (newText, cursorPosition, diff) => {
        return highlights.map((chunk) => {
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

            const updatedChunks = updateHighlights(
                newText,
                cursorPosition,
                diff
            );
            setHighlights(updatedChunks);
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

            const isOverlapping = highlights.some(
                (chunk) => startOffset < chunk.end && endOffset > chunk.start
            );

            if (isOverlapping) {
                return;
            }

            const color = getRandomColor(usedColors);
            setUsedColors([...usedColors, color]);
            setHighlights([
                ...highlights,
                {
                    id: `chunk${highlights.length + 1}`,
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

            const updatedChunks = updateHighlights(
                newText,
                cursorPosition,
                diff
            );
            setHighlights(updatedChunks);
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

        highlights.sort((a, b) => a.start - b.start);

        highlights.forEach((chunk) => {
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
        highlights.forEach((chunk) => {
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
    }, [highlights, documentText]);

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
    }, [applyHighlights, highlights]);

    return (
        <MainBox>
            <TextInputUtilityBar
                handleSave={handleSave}
                handleEmbed={handleEmbed}
                category={category}
                setCategory={setCategory}
                selectedChunk={selectedChunk}
                setSelectedChunk={setSelectedChunk}
                chunks={highlights}
                setChunks={setHighlights}
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
