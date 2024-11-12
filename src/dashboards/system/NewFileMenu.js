import React, { useState, useContext, useEffect, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
    Box,
    Typography,
    Tooltip,
    IconButton,
    TextField,
    InputAdornment,
    Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import { AuthContext } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketProvider';
import { SystemContext } from '../../contexts/SystemContext';
import ExpandableInput from './ExpandableInput';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { StyledIconButton } from '../chat/chatStyledComponents';

// Update the MessageBox styling
const MessageBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: theme.spacing(2),
    '& .MuiTypography-root': {
        fontSize: '1.1rem', // Larger text for better readability
        textAlign: 'center',
        color: theme.palette.text.primary,
        marginBottom: theme.spacing(1),
    },
    '& .button-group': {
        display: 'flex',
        gap: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
}));

const ExpandableBox = styled(Box)(({ theme, expanded }) => ({
    position: 'absolute',
    top: 2,
    right: 120,
    width: expanded ? '300px' : '25px',
    height: expanded ? '180px' : '25px', // Reduced from 250px
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[4],
    borderRadius: '20px',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
}));

const NewFileMenu = () => {
    const { socket } = useSocket();
    const { uid } = useContext(AuthContext);
    const {
        setSelectedFile,
        selectedFile,
        showSnackbar,
        newCategoryRef,
        createFile,
    } = useContext(SystemContext);
    const [expanded, setExpanded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [progressMessage, setProgressMessage] = useState('');
    const [messageTimeout, setMessageTimeout] = useState(null);
    const [showCollapse, setShowCollapse] = useState(false);
    const [showInput, setShowInput] = useState(true);
    const checkFileExists = useCallback(
        (filename) => {
            setProgressMessage('');
            socket.emit('file_check', { filename, uid });
        },
        [socket, uid]
    );

    useEffect(() => {
        if (!socket) return;
        const handleUpdate = (data) => {
            setProgressMessage(data.message);
        };

        const handleResult = (response) => {
            if (response.exists) {
                setSelectedFile({
                    path: response.path,
                    content: response.content,
                    category: response.category,
                });
                setProgressMessage('');
                setShowInput(true);
            } else {
                setProgressMessage(`File "${response.path}" does not exist.`);
                setPendingFile({
                    path: response.path,
                    content: '',
                    category: response.category,
                });
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
            console.log('Cleaning up sockets');
            socket.off('file_check_update', handleUpdate);
            socket.off('file_check_result', handleResult);
            socket.off('file_check_error', handleError);
        };
    }, [
        socket,
        setSelectedFile,
        showSnackbar,
        newCategoryRef,
        setExpanded,
        setProgressMessage,
    ]);

    const clearProgressMessage = useCallback(() => {
        setProgressMessage('');
    }, []);

    const setTemporaryMessage = useCallback(
        (message, duration = 1500) => {
            setProgressMessage(message);
            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }
            const newTimeout = setTimeout(clearProgressMessage, duration);
            setMessageTimeout(newTimeout);
        },
        [clearProgressMessage, messageTimeout]
    );

    useEffect(() => {
        return () => {
            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }
        };
    }, [messageTimeout]);

    const handleConfirmation = (confirmed) => {
        if (confirmed) {
            setSelectedFile(pendingFile);
            setTemporaryMessage(`File "${pendingFile.path}" created.`);
            createFile(pendingFile);
            setPendingFile(null);
            setTimeout(() => {
                handleExpandNewFile();
            }, 1500);
        } else {
            setShowInput(true);
            setPendingFile(null);
        }
        setInputValue('');
    };

    const handleExpandNewFile = () => {
        if (!expanded) {
            setExpanded(true);
            setShowInput(true); // Reset input visibility when expanding
            setTimeout(() => setShowCollapse(true), 50);
        } else {
            setShowCollapse(false);
            setTimeout(() => setExpanded(false), 10);
        }
        setProgressMessage('');
        setPendingFile(null);
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleExpandCategory = () => {
        setExpandedCategory(!expandedCategory);
    };

    const handleCategorySubmit = (categoryName) => {
        if (pendingFile) {
            setPendingFile({
                ...pendingFile,
                category: categoryName,
            });
        } else {
            setSelectedFile({
                ...selectedFile,
                category: categoryName,
            });
        }
        setExpandedCategory(false);
    };

    const handleSubmit = (filePath) => {
        checkFileExists(filePath);
        setShowInput(false);
    };

    return (
        <ExpandableBox expanded={expanded}>
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '25px',
                    height: '25px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <StyledIconButton onClick={handleExpandNewFile}>
                    <AddIcon
                        sx={{
                            transform: expanded ? 'rotate(45deg)' : 'none',
                            transition: 'transform 0.3s ease',
                        }}
                    />
                </StyledIconButton>
            </Box>

            <Collapse in={showCollapse} timeout="auto">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                    }}
                >
                    {showInput ? (
                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            placeholder="Enter file path"
                            value={inputValue}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() =>
                                                handleSubmit(inputValue)
                                            }
                                        >
                                            <SendIcon color="primary" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            autoFocus
                            onChange={handleChange}
                        />
                    ) : (
                        <MessageBox>
                            <Typography variant="subtitle2">
                                {progressMessage}
                            </Typography>
                            {pendingFile && (
                                <>
                                    <Box>
                                        <Tooltip title="Create file">
                                            <IconButton
                                                size="medium"
                                                color="primary"
                                                onClick={() =>
                                                    handleConfirmation(true)
                                                }
                                                sx={{ ml: 1 }}
                                            >
                                                <CheckCircleOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel">
                                            <IconButton
                                                size="medium"
                                                color="error"
                                                onClick={() =>
                                                    handleConfirmation(false)
                                                }
                                            >
                                                <CancelOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    <ExpandableInput
                                        expanded={expandedCategory}
                                        onExpand={handleExpandCategory}
                                        onSubmit={handleCategorySubmit}
                                        placeholder="Enter category name"
                                        buttonText={
                                            pendingFile?.category ||
                                            selectedFile?.category ||
                                            'Add Category'
                                        }
                                        initialValue={
                                            pendingFile?.category ||
                                            selectedFile?.category
                                        }
                                    />
                                </>
                            )}
                        </MessageBox>
                    )}
                </Box>
            </Collapse>
        </ExpandableBox>
    );
};

export default NewFileMenu;
