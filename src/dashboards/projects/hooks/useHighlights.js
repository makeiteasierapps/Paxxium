import { useCallback, useState, useRef, useEffect } from 'react';

export const useHighlights = (
    documentText,
    setDocumentText,
    highlights,
    setHighlights
) => {
    const [editingChunk, setEditingChunk] = useState(false);
    const [usedColors, setUsedColors] = useState([]);
    const [selectedChunk, setSelectedChunk] = useState(null);
    const contentEditableRef = useRef(null);

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

    const applyHighlights = useCallback(() => {
        const contentEditable = contentEditableRef.current;
        if (!contentEditable) return;

        console.log(highlights);
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

        console.log(elements);

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
    }, [documentText, highlights]);

    const handleInput = (e, project) => {
        const newText = e.target.innerText;
        const diff = newText.length - documentText.length;

        if (newText === '') {
            setHighlights([]);
            const savedData =
                JSON.parse(localStorage.getItem('textDocs')) || {};
            if (savedData[project.id]) {
                savedData[project.id].highlights = [];
                localStorage.setItem('textDocs', JSON.stringify(savedData));
            }
        } else if (diff !== 0) {
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

    return {
        highlights,
        setHighlights,
        contentEditableRef,
        handleInput,
        handleMouseUp,
        handleChunkClick,
        usedColors,
        setUsedColors,
        selectedChunk,
        setSelectedChunk,
        applyHighlights,
    };
};
