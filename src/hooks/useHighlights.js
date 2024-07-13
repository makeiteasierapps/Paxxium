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

    const handleColorChange = (event, newValue) => {
        if (selectedChunk) {
            const newColor = `#${newValue.toString(16).padStart(6, '0')}`;
            const updatedChunks = highlights.map((chunk) =>
                chunk.id === selectedChunk.id
                    ? { ...chunk, color: newColor }
                    : chunk
            );
            setHighlights(updatedChunks);
            setUsedColors([...usedColors, newColor]);
            setSelectedChunk({ ...selectedChunk, color: newColor });
            applyHighlights();
        }
    };

    const handleRangeSliderChange = (event, newValue) => {
        const [newStart, newEnd] = newValue;
        if (selectedChunk) {
            const updatedChunks = highlights.map((chunk) =>
                chunk.id === selectedChunk.id
                    ? {
                          ...chunk,
                          start: newStart,
                          end: newEnd,
                          text: documentText.substring(newStart, newEnd),
                      }
                    : chunk
            );
            setHighlights(updatedChunks);
            setSelectedChunk({
                ...selectedChunk,
                start: newStart,
                end: newEnd,
                text: documentText.substring(newStart, newEnd),
            });
            applyHighlights();
        }
    };

    const handleDelete = () => {
        const updatedChunks = highlights.filter(
            (chunk) => chunk.id !== selectedChunk.id
        );
        setHighlights(updatedChunks);
        setSelectedChunk(null);
        setEditingChunk(false);
        applyHighlights();
    };

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

    const handleInput = (e, project) => {
        const contentEditable = contentEditableRef.current;
        const newText = e.target.innerText;
        const diff = newText.length - documentText.length;

        // Save the current scroll position
        const scrollTop = contentEditable.scrollTop;

        if (diff !== 0) {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(contentEditable);
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

        // Apply highlights and restore selection
        applyHighlights();

        // Restore the scroll position
        contentEditable.scrollTop = scrollTop;
    };

    const handleMouseUp = () => {
        if (editingChunk) return;

        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        const offset = range.startOffset;

        if (container.nodeType === 3) {
            const parent = container.parentNode;
            if (parent && parent.hasAttribute('data-chunk-id')) {
                const chunkId = parent.getAttribute('data-chunk-id');
                const chunk = highlights.find((chunk) => chunk.id === chunkId);

                if (chunk) {
                    const isAtStart = offset === 0;
                    const isAtEnd = offset === container.length;

                    if (isAtStart) {
                        moveCursorBeforeChunk(range, parent);
                    } else if (isAtEnd) {
                        moveCursorAfterChunk(range, parent);
                    } else {
                        preventEditing(selection);
                    }
                    return;
                }
            }
        }

        const selectedText = selection.toString();
        if (selectedText) {
            const preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(contentEditableRef.current);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            const startOffset = preSelectionRange.toString().length;
            const endOffset = startOffset + selectedText.length;

            const isOverlapping = highlights.some(
                (chunk) => startOffset < chunk.end && endOffset > chunk.start
            );

            if (isOverlapping) return;

            const color = getRandomColor(usedColors);
            setUsedColors([...usedColors, color]);
            setHighlights([
                ...highlights,
                {
                    id: `chunk${Date.now()}`,
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

    const moveCursorBeforeChunk = (range, parent) => {
        const previousNode = parent.previousSibling;
        if (previousNode && previousNode.nodeType === 3) {
            range.setStart(previousNode, previousNode.length);
            range.setEnd(previousNode, previousNode.length);
        } else {
            range.setStartBefore(parent);
            range.setEndBefore(parent);
        }
        updateSelection(range);
    };

    const moveCursorAfterChunk = (range, parent) => {
        const nextNode = parent.nextSibling;
        if (nextNode && nextNode.nodeType === 3) {
            range.setStart(nextNode, 0);
            range.setEnd(nextNode, 0);
        } else {
            range.setStartAfter(parent);
            range.setEndAfter(parent);
        }
        updateSelection(range);
    };

    const preventEditing = (selection) => {
        selection.removeAllRanges();
    };

    const updateSelection = (range) => {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);
            const container = range.startContainer;
            const offset = range.startOffset;

            if (container.nodeType !== 3) return;
            // Text node
            const parent = container.parentNode;
            if (parent && parent.hasAttribute('data-chunk-id')) {
                const chunkId = parent.getAttribute('data-chunk-id');
                const chunk = highlights.find((chunk) => chunk.id === chunkId);

                if (chunk) {
                    const isAtStart = offset === 0;
                    const isAtEnd = offset === container.length;

                    if (
                        (e.key === 'Backspace' && isAtStart) ||
                        (e.key === 'Delete' && isAtEnd)
                    ) {
                        // Prevent backspace or delete from deleting the chunk
                        e.preventDefault();
                        return;
                    }
                }
            } else {
                // Check if the cursor is just outside a chunk
                const previousSibling = container.previousSibling;
                const nextSibling = container.nextSibling;

                if (
                    (e.key === 'Backspace' &&
                        previousSibling &&
                        previousSibling.hasAttribute('data-chunk-id') &&
                        offset === 0) ||
                    (e.key === 'Delete' &&
                        nextSibling &&
                        nextSibling.hasAttribute('data-chunk-id') &&
                        offset === container.length)
                ) {
                    e.preventDefault();
                    return;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [highlights]);

    const applyHighlights = useCallback(() => {
        const contentEditable = contentEditableRef.current;
        if (!contentEditable) return;

        const scrollTop = contentEditable.scrollTop;
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
                    `<span style="background-color: ${chunk.color};" data-chunk-id="${chunk.id}" contenteditable="false">${documentText.substring(startIndex, endIndex)}</span>`
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
                chunkElement.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    handleChunkClick(chunk);
                });
            }
        });

        restoreSelection(contentEditable, savedSelection);
        contentEditable.scrollTop = scrollTop;
    }, [documentText, highlights]);

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
        handleColorChange,
        handleRangeSliderChange,
        handleDelete,
    };
};
