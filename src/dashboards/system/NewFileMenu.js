import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/system';
import { AuthContext } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketProvider';
import { ConfigContext } from '../../contexts/ConfigContext';

const AnimatedContainer = styled(Box)(({ theme, expanded }) => ({
    width: expanded ? '300px' : '100px',
    transition: 'width 0.3s ease-in-out',
    overflow: 'hidden',
}));

const MessageBox = styled(Box)(({ theme }) => ({
    marginLeft: theme.spacing(2),

    color: theme.palette.text.secondary,
    minWidth: '200px',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
}));

const NewFileMenu = () => {
    const { socket } = useSocket();
    const { uid } = useContext(AuthContext);
    const { setSelectedFile, showSnackbar } = useContext(ConfigContext);
    const [expanded, setExpanded] = useState(false);
    const [filename, setFilename] = useState('');
    const [progressMessage, setProgressMessage] = useState('');

    const handleClick = () => {
        setExpanded(!expanded);
    };

    const checkFileExists = useCallback(
        (filename) => {
            setProgressMessage('');
            socket.emit('file_check', { filename, uid });
        },
        [socket, uid]
    );

    useEffect(() => {
        const handleUpdate = (data) => {
            console.log('File check update:', data);
            setProgressMessage(data.message);
        };

        const handleResult = (response) => {
            console.log('File check result:', response);
            if (response.exists) {
                setSelectedFile({
                    filename,
                    content: response.content,
                    category: response.category,
                });
                setProgressMessage(
                    `File "${filename}" exists and has been loaded.`
                );
            } else {
                setProgressMessage(`File "${filename}" does not exist.`);
            }
        };

        const handleError = (error) => {
            console.error('Error checking if file exists:', error.error);
            showSnackbar('Error checking if file exists', 'error');
            setProgressMessage(`Error: ${error.error}`);
        };

        socket.on('file_check_update', handleUpdate);
        socket.on('file_check_result', handleResult);
        socket.on('file_check_error', handleError);

        return () => {
            socket.off('file_check_update', handleUpdate);
            socket.off('file_check_result', handleResult);
            socket.off('file_check_error', handleError);
        };
    }, [socket, filename, setSelectedFile, showSnackbar]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
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
            {expanded && (
                <MessageBox>
                    <Typography variant="subtitle2">
                        {progressMessage}
                    </Typography>
                </MessageBox>
            )}
        </Box>
    );
};

export default NewFileMenu;
