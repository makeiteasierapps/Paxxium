import { useState } from 'react';

export const useHighlights = (highlights, setHighlights, quill) => {
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

    return {
        highlights,
        setHighlights,
        handleChunkClick,
        selectedChunk,
        setSelectedChunk,
        handleColorChange,
        removeHighlight,
        getRandomColor,
    };
};
