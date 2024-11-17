import { useContext, useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import {
    Typography,
    Box,
    Grid,
    Checkbox,
    TextField,
    CircularProgress,
} from '@mui/material';
import { SystemContext } from '../../contexts/SystemContext';
import Chat from '../chat/components/Chat';
import { StyledIconButton } from '../chat/chatStyledComponents';

const FileItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px 0 0',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const ContextResearch = () => {
    const {
        contextFiles,
        getAgentResponse,
        systemAgentMessages,
    } = useContext(SystemContext);
    const [input, setInput] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        if (contextFiles?.length) {
            setSelectedFiles(contextFiles);
        }
    }, [contextFiles]);

    const handleSubmit = () => {
        getAgentResponse(input);
    };

    const handleCheckboxChange = (file) => {
        setSelectedFiles((prev) => {
            const isSelected = prev.some(
                (selectedFile) => selectedFile.path === file.path
            );
            if (isSelected) {
                return prev.filter(
                    (selectedFile) => selectedFile.path !== file.path
                );
            } else {
                return [...prev, file];
            }
        });
    };

    return (
        <>
            <TextField
                sx={{
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
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(event) => {
                    if (
                        event.key === 'Enter' &&
                        !event.shiftKey &&
                        input.trim() !== ''
                    ) {
                        event.preventDefault();
                        handleSubmit();
                        setInput('');
                    }
                }}
                InputProps={{
                    endAdornment: (
                        <StyledIconButton onClick={handleSubmit}>
                            <SendIcon />
                        </StyledIconButton>
                    ),
                }}
            />
            <Grid
                container
                justifyContent="center"
                spacing={1}
                sx={{
                    p: 1,
                    width: 'auto',
                    margin: '0 auto',
                    maxWidth: '500px',
                }}
            >
                {contextFiles?.map((file, index) => (
                    <Grid
                        item
                        lg={4}
                        key={file.path}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <FileItem>
                            <Checkbox
                                checked={selectedFiles.some(
                                    (selectedFile) =>
                                        selectedFile.path === file.path
                                )}
                                onChange={() => handleCheckboxChange(file)}
                                sx={{
                                    p: '0 4px',
                                    '& .MuiSvgIcon-root': { fontSize: 14 },
                                }}
                            />
                            <Typography noWrap>
                                {file.path.split('/').pop()}
                            </Typography>
                        </FileItem>
                    </Grid>
                ))}
            </Grid>
            {systemAgentMessages.length > 0 && (
                <Chat messages={systemAgentMessages} />
            )}
        </>
    );
};

export default ContextResearch;
