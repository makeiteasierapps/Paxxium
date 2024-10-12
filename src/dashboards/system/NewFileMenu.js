import React, { useState, useContext } from 'react';
import {
    Box,
    Button,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/system';
import { ConfigContext } from '../../contexts/ConfigContext';
const AnimatedContainer = styled(Box)(({ theme, expanded }) => ({
    width: expanded ? '300px' : '100px',
    transition: 'width 0.3s ease-in-out',
    overflow: 'hidden',
}));

const NewFileMenu = () => {
    const { checkFileExists } = useContext(ConfigContext);
    const [expanded, setExpanded] = useState(false);
    const [filename, setFilename] = useState('');
    const handleClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Box>
            <AnimatedContainer expanded={expanded}>
                {expanded ? (
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter file name"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            checkFileExists(filename)
                                        }
                                    >
                                        <SendIcon color="primary" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        autoFocus
                        onChange={(e) => setFilename(e.target.value)}
                    />
                ) : (
                    <Button variant="outlined" onClick={handleClick}>
                        New File
                    </Button>
                )}
            </AnimatedContainer>
        </Box>
    );
};

export default NewFileMenu;
