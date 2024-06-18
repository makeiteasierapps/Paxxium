import { Box, Typography, Button, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getEncoding } from 'js-tiktoken';

const encoding = getEncoding('cl100k_base');

const MainUtilityBox = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px',
});

const TextInputUtilityBar = ({
    handleSave,
    selectedChunk,
    setSelectedChunk,
    chunks,
    setChunks,
    usedColors,
    setUsedColors,
    applyHighlights,
    text,
}) => {
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

    const handleRangeSliderChange = (event, newValue) => {
        const [newStart, newEnd] = newValue;
        if (selectedChunk) {
            const updatedChunks = chunks.map((chunk) =>
                chunk.id === selectedChunk.id
                    ? {
                          ...chunk,
                          start: newStart,
                          end: newEnd,
                          text: text.substring(newStart, newEnd),
                      }
                    : chunk
            );
            setChunks(updatedChunks);
            setSelectedChunk({
                ...selectedChunk,
                start: newStart,
                end: newEnd,
                text: text.substring(newStart, newEnd),
            });
            applyHighlights();
        }
    };

    return (
        <MainUtilityBox>
            {selectedChunk && (
                <>
                    <Typography>
                        Token Count:
                        {encoding.encode(selectedChunk?.text || '').length}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography>Adjust Highlight Color:</Typography>
                        <Slider
                            value={parseInt(selectedChunk.color.slice(1), 16)}
                            onChange={handleColorChange}
                            min={0}
                            max={0xffffff}
                            step={1}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography>Adjust Highlight Range:</Typography>
                        <Slider
                            value={[selectedChunk.start, selectedChunk.end]}
                            onChange={handleRangeSliderChange}
                            min={0}
                            max={text.length}
                        />
                    </Box>
                </>
            )}
            <Button variant="outlined" color="primary" onClick={handleSave}>
                Save
            </Button>
        </MainUtilityBox>
    );
};

export default TextInputUtilityBar;
