import { useContext } from 'react';
import { Box, Typography, Button, Slider } from '@mui/material';
import { Delete, Close } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { StyledIconButton } from '../../../chat/chatStyledComponents';
import { getEncoding } from 'js-tiktoken';
import { KbContext } from '../../../../contexts/KbContext';

const encoding = getEncoding('cl100k_base');

const MainUtilityBox = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px',
});

const TextInputUtilityBar = ({ onClose }) => {
    const {
        highlightsManager: {
            selectedChunk,
            handleColorChange,
            removeHighlight,
        },
        textEditorManager: { handleSave, handleEmbed, removeDocumentDetails },
    } = useContext(KbContext);

    return (
        <MainUtilityBox>
            {selectedChunk && (
                <>
                    <Box>
                        <Typography>Token Count:</Typography>
                        <Typography>
                            {encoding.encode(selectedChunk?.text || '').length}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography>Color:</Typography>
                        <Slider
                            value={parseInt(selectedChunk.color.slice(1), 16)}
                            onChange={handleColorChange}
                            min={0}
                            max={0xffffff}
                            step={1}
                        />
                    </Box>
                    <StyledIconButton onClick={removeHighlight}>
                        <Delete />
                    </StyledIconButton>
                </>
            )}
            <StyledIconButton
                variant="outlined"
                color="primary"
                onClick={() => {
                    removeDocumentDetails();
                    onClose();
                }}
            >
                <Close />
            </StyledIconButton>
            <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                    handleSave();
                }}
            >
                Save
            </Button>
            <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                    handleEmbed();
                }}
            >
                Embed
            </Button>
        </MainUtilityBox>
    );
};

export default TextInputUtilityBar;
