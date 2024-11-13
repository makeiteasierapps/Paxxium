import { useContext, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { Typography, Box } from '@mui/material';
import { SystemContext } from '../../contexts/SystemContext';
import {
    StyledInputTextField,
    InputArea,
    StyledBox,
    StyledIconButton,
} from '../chat/chatStyledComponents';

const ContextResearch = () => {
    const { generateContextFiles, contextFiles } = useContext(SystemContext);
    const [input, setInput] = useState('');
    return (
        <>
            <InputArea>
                <StyledBox>
                    <StyledInputTextField
                        fullWidth
                        multiline
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(event) => {
                            if (
                                event.key === 'Enter' &&
                                !event.shiftKey &&
                                input.trim() !== ''
                            ) {
                                event.preventDefault();
                                generateContextFiles(input);
                                setInput('');
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <StyledIconButton
                                    onClick={() => generateContextFiles(input)}
                                >
                                    <SendIcon />
                                </StyledIconButton>
                            ),
                        }}
                    />
                </StyledBox>
            </InputArea>
            {contextFiles?.map((file) => (
                <Box key={file.path} display="flex">
                    <StyledBox
                        display="grid"
                        gridTemplateColumns="repeat(auto-fill, minmax(100px, 1fr))"
                        justifyContent="center"
                    >
                        <Typography>{file.path.split('/').pop()}</Typography>
                    </StyledBox>
                </Box>
            ))}
        </>
    );
};

export default ContextResearch;
