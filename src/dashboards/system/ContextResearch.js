import { useContext, useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Typography, Box, Grid } from '@mui/material';
import { SystemContext } from '../../contexts/SystemContext';
import Chat from '../chat/components/Chat';
import ChatBar from '../chat/components/ChatBar';
import ExpandableInput from './ExpandableInput';

const FileItem = styled(Box)(({ theme, selected }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0 3px',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: selected ? theme.palette.background.user : 'transparent',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: selected
            ? theme.palette.action.selected
            : theme.palette.action.hover,
    },
}));

const ContextResearch = () => {
    const {
        contextFiles,
        setContextFiles,
        getAgentResponse,
        systemAgentMessages,
        setSystemAgentMessages,
        setSelectedFile,
    } = useContext(SystemContext);
    const [longPressTimer, setLongPressTimer] = useState(null);
    const [isLongPress, setIsLongPress] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        if (contextFiles?.length) {
            setSelectedFiles(contextFiles);
        }
    }, [contextFiles]);

    const handleSubmit = (query) => {
        setContextFiles([]);
        setSystemAgentMessages([]);
        getAgentResponse(query);
    };

    const handleFilePress = (file) => {
        if (!isLongPress) {
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
        }
        setIsLongPress(false);
    };

    const handleMouseDown = (file) => {
        const timer = setTimeout(() => {
            setIsLongPress(true);
            setSelectedFile(file);
        }, 500); // 500ms for long press
        setLongPressTimer(timer);
    };

    const handleMouseUp = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const sx = {
        width: '100%',
        p: 2,
        margin: '0 auto',
        height: '60vh',
        overflow: 'auto',
    };
    useEffect(() => {
        if (systemAgentMessages.length > 0) {
            setExpanded(false);
        }
    }, [systemAgentMessages]);

    return (
        <>
            <Box width="100%" p={2}>
                <ExpandableInput
                    expanded={expanded}
                    onExpand={setExpanded}
                    onSubmit={handleSubmit}
                    placeholder="Ask the SystemAgent..."
                    buttonText="SystemAgent"
                />
            </Box>
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
                        <FileItem
                            selected={selectedFiles.some(
                                (selectedFile) =>
                                    selectedFile.path === file.path
                            )}
                            onClick={() => handleFilePress(file)}
                            onMouseDown={() => handleMouseDown(file)}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <Typography noWrap fontSize="14px">
                                {file.path.split('/').pop()}
                            </Typography>
                        </FileItem>
                    </Grid>
                ))}
            </Grid>
            {systemAgentMessages.length > 0 && (
                <>
                    <ChatBar />
                    <Chat messages={systemAgentMessages} sx={sx} />
                </>
            )}
        </>
    );
};

export default ContextResearch;
