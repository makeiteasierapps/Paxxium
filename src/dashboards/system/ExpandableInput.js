import { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/system';

const AnimatedContainer = styled(Box)(({ theme, expanded }) => ({
    width: expanded ? '300px' : 'auto',
    transition: 'width 0.3s ease-in-out',
    overflow: 'hidden',
}));

const ExpandableInput = ({
    expanded,
    onExpand,
    onSubmit,
    placeholder = 'Enter value',
    buttonText = 'Expand',
    initialValue = '',
}) => {
    const [inputValue, setInputValue] = useState(initialValue);

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = () => {
        onSubmit(inputValue);
        setInputValue('');
    };

    return (
        <AnimatedContainer expanded={expanded}>
            {expanded ? (
                <TextField
                    fullWidth
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
            ) : (
                <Button variant="outlined" onClick={onExpand}>
                    {buttonText}
                </Button>
            )}
        </AnimatedContainer>
    );
};

export default ExpandableInput;
