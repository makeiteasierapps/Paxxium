import { useState, useCallback } from 'react';

export const useHighlightManager = (highlights, setHighlights, quill) => {
    const [selectedChunk, setSelectedChunk] = useState(null);

    const handleColorChange = (event, newValue) => {
        if (selectedChunk) {
            const newColor = `#${newValue.toString(16).padStart(6, '0')}`;
            const updatedChunks = highlights.map((chunk) =>
                chunk.id === selectedChunk.id
                    ? { ...chunk, color: newColor }
                    : chunk
            );
            setHighlights(updatedChunks);
            setSelectedChunk({ ...selectedChunk, color: newColor });
        }
    };

    const removeHighlight = () => {
        if (selectedChunk && quill) {
            console.log(selectedChunk);
            const updatedChunks = highlights.filter(
                (chunk) => chunk.id !== selectedChunk.id
            );
            setHighlights(updatedChunks);

            // Remove the background color from the Quill editor
            quill.formatText(
                selectedChunk.start,
                selectedChunk.end - selectedChunk.start,
                { background: false }
            );

            setSelectedChunk(null);
        }
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

    const handleChunkClick = (chunk) => {
        if (chunk) {
            setSelectedChunk((prevSelectedChunk) => {
                if (prevSelectedChunk?.id === chunk.id) {
                    return null;
                }
                return { ...chunk };
            });
        }
    };

    const applyHighlights = useCallback(() => {
        if (quill) {
            highlights.forEach(({ start, end, color }) => {
                quill.formatText(start, end - start, { background: color });
            });
        }
    }, [quill, highlights]);


    const handleHighlight = (range) => {
        if (quill && range && range.length > 0) {
            const color = getRandomColor(highlights.map((h) => h.color));
            const newHighlights = [];

            let currentIndex = range.index;
            const endIndex = range.index + range.length;

            const findNextUnhighlightedSection = (start, end) => {
                return highlights.find((h) => h.start > start && h.start < end);
            };

            const createHighlight = (start, end) => {
                quill.formatText(start, end - start, { background: color });
                return {
                    id: `chunk${highlights.length + newHighlights.length + 1}`,
                    start: start,
                    end: end,
                    color: color,
                    text: quill.getText(start, end - start),
                };
            };

            while (currentIndex < endIndex) {
                const nextHighlight = findNextUnhighlightedSection(
                    currentIndex,
                    endIndex
                );
                const sectionEnd = nextHighlight
                    ? nextHighlight.start
                    : endIndex;

                newHighlights.push(createHighlight(currentIndex, sectionEnd));

                currentIndex = nextHighlight ? nextHighlight.end : endIndex;
            }

            setHighlights([...highlights, ...newHighlights]);
        }
    };

    return {
        highlights,
        setHighlights,
        handleChunkClick,
        selectedChunk,
        setSelectedChunk,
        handleColorChange,
        removeHighlight,
        applyHighlights,
        handleHighlight,
    };
};
