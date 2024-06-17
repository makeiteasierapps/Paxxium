import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Slider, TextField } from '@mui/material';
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

const MainUtilityBox = styled(Box)({
    display: 'flex',
    width: '100%',
    padding: '10px',
});

const TextInputUtilityBar = ({ TokenCount, handleSave }) => {
    return (
        <MainUtilityBox>
            <Typography>Token Count: {TokenCount}</Typography>
            <Button variant="outlined" color="primary" onClick={handleSave}>
                Save
            </Button>
        </MainUtilityBox>
    );
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

    const applyHighlights = () => {
        const contentEditable = contentEditableRef.current;
        if (!contentEditable) return;

        let lastIndex = 0;
        const elements = [];

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
    };

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

    const handleColorChange = (event, newValue) => {
        if (selectedChunk) {
            const newColor = `#${newValue.toString(16).padStart(6, '0')}`;
            const updatedChunks = chunks.map((chunk) =>
                chunk.id === selectedChunk.id
                    ? { ...chunk, color: newColor }
                    : chunk
            );
            setChunks(updatedChunks);
            setUsedColors([...usedColors, newColor]);
            setSelectedChunk({ ...selectedChunk, color: newColor });
            applyHighlights();
        }
    };

    const handleRangeChange = (event) => {
        const { name, value } = event.target;
        const newValue = parseInt(value);
        if (selectedChunk) {
            const updatedChunks = chunks.map((chunk) =>
                chunk.id === selectedChunk.id
                    ? {
                          ...chunk,
                          [name]: newValue,
                          text: text.substring(start, end),
                      }
                    : chunk
            );
            setChunks(updatedChunks);
            if (name === 'start') {
                setStart(newValue);
            } else if (name === 'end') {
                setEnd(newValue);
            }
            applyHighlights();
        }
    };

    useEffect(() => {
        applyHighlights();
    }, [chunks]);

    return (
        <MainBox>
            <TextInputUtilityBar
                TokenCount={encoding.encode(text).length}
                handleSave={handleSave}
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
            {selectedChunk && (
                <Box sx={{ padding: '10px', marginTop: '10px' }}>
                    <Typography>Adjust Highlight Color:</Typography>
                    <Slider
                        value={parseInt(selectedChunk.color.slice(1), 16)}
                        onChange={handleColorChange}
                        min={0}
                        max={0xffffff}
                        step={1}
                    />
                    <Typography>Adjust Highlight Range:</Typography>
                    <TextField
                        label="Start"
                        type="number"
                        name="start"
                        value={start}
                        onChange={handleRangeChange}
                        inputProps={{ min: 0, max: text.length }}
                        sx={{ marginRight: '10px' }}
                    />
                    <TextField
                        label="End"
                        type="number"
                        name="end"
                        value={end}
                        onChange={handleRangeChange}
                        inputProps={{ min: 0, max: text.length }}
                    />
                </Box>
            )}
        </MainBox>
    );
};

export default TextFieldComponent;
