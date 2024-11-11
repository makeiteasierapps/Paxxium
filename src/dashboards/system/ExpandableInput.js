import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/system';

const AnimatedContainer = styled(Box)(({ theme, expanded }) => ({
    width: expanded ? '250px' : 'auto',
    transition: 'width 0.3s ease-in-out',
    overflow: 'hidden',
    '& .MuiOutlinedInput-root': {
        borderRadius: '20px',
        height: '40px',
    },
    '& .MuiButton-root': {
        borderRadius: '20px',
        padding: '4px 12px',
        minWidth: '32px',
    },
    '& .MuiIconButton-root': {
        padding: '6px',
    },
}));

const ExpandableInput = ({
    expanded,
    onExpand,
    onSubmit,
    placeholder = 'Enter value',
    buttonText = 'Expand',
    value = '',
    iconOnly = false,
}) => {
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                onExpand(false);
            }
        };

        if (expanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [expanded, onExpand]);

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = () => {
        onSubmit(inputValue);
        setInputValue('');
    };

    return (
        <AnimatedContainer expanded={expanded} ref={inputRef}>
            {expanded ? (
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder={placeholder}
                    value={inputValue}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleSubmit}>
                                    <SendIcon color="primary" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    autoFocus
                    onChange={handleChange}
                />
            ) : iconOnly ? (
                <IconButton onClick={() => onExpand(true)} title="Add new file">
                    <AddIcon />
                </IconButton>
            ) : (
                <Button variant="outlined" onClick={() => onExpand(true)}>
                    {buttonText}
                </Button>
            )}
        </AnimatedContainer>
    );
};

export default ExpandableInput;
