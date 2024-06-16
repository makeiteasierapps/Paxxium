import { useState, useEffect } from 'react';
import { TextField, Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import { getEncoding } from 'js-tiktoken';

const encoding = getEncoding('cl100k_base');

const StyledTextField = styled(TextField)({
    display: 'flex',
    width: '100%',
    height: '100%',
    padding: '10px 0px 0px 0px',
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: 'none',
        },
    },
    '& .MuiInputBase-root': {
        padding: '0px 20px',
    },
});

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
    } while (usedColors.includes(color));
    return color;
};

const TextFieldComponent = ({ project }) => {
    const [text, setText] = useState('');
    const [chunks, setChunks] = useState([]);
    const [usedColors, setUsedColors] = useState([]);

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        setText(savedData[project.id] || '');
    }, [project.id]);

    const handleSave = () => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        savedData[project.id] = text;
        localStorage.setItem('textDocs', JSON.stringify(savedData));
    };

    const handleNewText = (e) => {
        setText(e.target.value);
    };

    const handleMouseUp = () => {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        if (selectedText) {
            const color = getRandomColor(usedColors);
            setUsedColors([...usedColors, color]);
            setChunks([
                ...chunks,
                {
                    id: `chunk${chunks.length + 1}`,
                    text: selectedText,
                    color: color,
                },
            ]);
        }
    };

    const renderTextWithHighlights = () => {
        let lastIndex = 0;
        const elements = [];

        chunks.forEach((chunk, index) => {
            const startIndex = text.indexOf(chunk.text, lastIndex);
            if (startIndex !== -1) {
                if (startIndex > lastIndex) {
                    elements.push(text.substring(lastIndex, startIndex));
                }
                elements.push(
                    <span key={index} style={{ backgroundColor: chunk.color }}>
                        {chunk.text}
                    </span>
                );
                lastIndex = startIndex + chunk.text.length;
            }
        });

        if (lastIndex < text.length) {
            elements.push(text.substring(lastIndex));
        }

        return elements;
    };

    return (
        <MainBox>
            <TextInputUtilityBar
                TokenCount={encoding.encode(text).length}
                handleSave={handleSave}
            />
            <StyledTextField
                value={text}
                onChange={handleNewText}
                onMouseUp={handleMouseUp}
                multiline
                rows={10}
            />
            <div
                style={{
                    whiteSpace: 'pre-wrap',
                    padding: '10px 20px',
                    border: '1px solid #e0e0e0',
                    height: '100%',
                    overflowY: 'auto',
                    marginTop: '10px',
                }}
            >
                {renderTextWithHighlights()}
            </div>
        </MainBox>
    );
};

export default TextFieldComponent;