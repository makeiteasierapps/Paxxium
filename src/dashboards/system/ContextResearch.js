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
import ExpandableInput from './ExpandableInput';
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
        setContextFiles,
        getAgentResponse,
        systemAgentMessages,
        setSystemAgentMessages,
    } = useContext(SystemContext);
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
    useEffect(() => {
        if (systemAgentMessages.length > 0) {
            setExpanded(false);
        }
    }, [systemAgentMessages]);

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
            <ExpandableInput
                expanded={expanded}
                onExpand={setExpanded}
                onSubmit={handleSubmit}
                placeholder="Ask the SystemAgent..."
                buttonText="SystemAgent"
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
