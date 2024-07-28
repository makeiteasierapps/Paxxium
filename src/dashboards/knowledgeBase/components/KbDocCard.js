import { useContext, useState, useMemo, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    CardActions,
    IconButton,
    Typography,
} from '@mui/material';
import {
    Delete,
    OpenInNew,
    ArrowBackIos,
    ArrowForwardIos,
} from '@mui/icons-material';

import { KbContext } from '../../../contexts/KbContext';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import TextEditor from './textEditor/TextEditor';
import Markdown from 'react-markdown';

const KbDocCard = ({ document }) => {
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const { deleteKbDoc } = useContext(KbContext);

    const urls = useMemo(() => document.urls || [], [document]);

    useEffect(() => {
        setCurrentUrlIndex(urls.length - 1);
    }, [urls]);

    const currentContent = useMemo(() => {
        if (urls.length === 0) return '';
        return urls[currentUrlIndex].content || '';
    }, [urls, currentUrlIndex]);

    const handlePrevUrl = () => {
        setCurrentUrlIndex((prevIndex) =>
            prevIndex < urls.length - 1 ? prevIndex + 1 : 0
        );
    };

    const handleNextUrl = () => {
        setCurrentUrlIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : urls.length - 1
        );
    };

    const handleDelete = () => {
        deleteKbDoc(document.kb_id, document.id);
    };

    const toggleEditor = () => {
        setIsEditorOpen(!isEditorOpen);
    };

    return (
        <Card
            sx={{
                width: '100%',
                height: '500px',
                backgroundColor: '#111111',
            }}
            elevation={6}
        >
            <CardHeader
                title="Document Source"
                subheader={
                    <>
                        <Typography
                            variant="body2"
                            sx={{
                                maxWidth: '90%',
                                display: 'inline-block',
                                verticalAlign: 'middle',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {urls[currentUrlIndex].source}
                        </Typography>
                        {urls.length > 1 && (
                            <Typography
                                variant="caption"
                                display="block"
                                sx={{ mt: 0.5 }}
                            >
                                Page {urls.length - currentUrlIndex} of{' '}
                                {urls.length}
                            </Typography>
                        )}
                    </>
                }
            />
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        padding: 2,
                        height: '300px',
                        overflow: 'auto',
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1,
                        overflowX: 'hidden',
                    }}
                >
                    <Markdown
                        components={{
                            pre: ({ node, ...props }) => (
                                <pre
                                    style={{
                                        overflowX: 'auto',
                                        maxWidth: '100%',
                                    }}
                                    {...props}
                                />
                            ),
                            code: ({ node, ...props }) => (
                                <code
                                    style={{
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                    {...props}
                                />
                            ),
                            img: ({ node, ...props }) => (
                                <img
                                    alt={props.alt}
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        objectFit: 'contain',
                                    }}
                                    {...props}
                                />
                            ),
                            p: ({ node, ...props }) => (
                                <p
                                    style={{
                                        overflowWrap: 'break-word',
                                        wordWrap: 'break-word',
                                    }}
                                    {...props}
                                />
                            ),
                        }}
                    >
                        {currentContent}
                    </Markdown>
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between' }}>
                <Box>
                    <StyledIconButton onClick={handleDelete}>
                        <Delete />
                    </StyledIconButton>
                    <StyledIconButton onClick={toggleEditor}>
                        <OpenInNew />
                    </StyledIconButton>
                </Box>
                {urls.length > 1 && (
                    <Box>
                        <IconButton onClick={handlePrevUrl}>
                            <ArrowBackIos />
                        </IconButton>
                        <IconButton onClick={handleNextUrl}>
                            <ArrowForwardIos />
                        </IconButton>
                    </Box>
                )}
            </CardActions>
            {isEditorOpen && (
                <TextEditor
                    open={isEditorOpen}
                    onClose={toggleEditor}
                    doc={document}
                    currentUrlIndex={currentUrlIndex}
                    setCurrentUrlIndex={setCurrentUrlIndex}
                />
            )}
        </Card>
    );
};

export default KbDocCard;
