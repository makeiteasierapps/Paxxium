import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketProvider';
import { SystemContext } from '../../contexts/SystemContext';
import ExpandableInput from './ExpandableInput';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { MessageBox } from './systemStyledComponents';

const NewFileMenu = () => {
    const { socket } = useSocket();
    const { uid } = useContext(AuthContext);
    const { setSelectedFile, selectedFile, showSnackbar, newCategoryRef } =
        useContext(SystemContext);
    const [expanded, setExpanded] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [progressMessage, setProgressMessage] = useState('');
    const [messageTimeout, setMessageTimeout] = useState(null);

    const checkFileExists = useCallback(
        (filename) => {
            setProgressMessage('');
            socket.emit('file_check', { filename, uid });
        },
        [socket, uid]
    );

    useEffect(() => {
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
            } else {
                setProgressMessage(`File "${response.path}" does not exist.`);
                setPendingFile({
                    path: response.path,
                    content: '',
                    category: response.category,
                });
            }
            setExpanded(false);
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
        } else {
            setTemporaryMessage(`File creation cancelled.`);
        }
        setPendingFile(null);
    };

    const handleExpandNewFile = () => {
        setExpanded(!expanded);
        setProgressMessage('');
        setSelectedFile(null);
        setPendingFile(null);
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
    };

    return (
        <>
            <ExpandableInput
                expanded={expanded}
                onExpand={handleExpandNewFile}
                onSubmit={handleSubmit}
                placeholder="Enter file name"
                iconOnly
            />
            {pendingFile ? (
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
                        pendingFile?.category || selectedFile?.category
                    }
                />
            ) : null}

            <MessageBox>
                <Typography variant="subtitle2">{progressMessage}</Typography>
                {pendingFile && (
                    <>
                        <Tooltip title="Create file">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleConfirmation(true)}
                                sx={{ ml: 1 }}
                            >
                                <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleConfirmation(false)}
                            >
                                <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </MessageBox>
        </>
    );
};

export default NewFileMenu;
