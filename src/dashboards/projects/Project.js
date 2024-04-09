import { useContext, useRef, useEffect } from 'react';
import { styled } from '@mui/system';
import { ProjectContext } from './ProjectContext';
import { ChatContext } from '../agents/chat/ChatContext';
import { AuthContext } from '../../auth/AuthContext';
import WebScrapeForm from './WebScrapeForm';
import ProjectChat from '../agents/chat/Chat';
import { StyledIconButton } from '../agents/agentStyledComponents';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    CardActions,
} from '@mui/material';
import { WebAsset, FileCopy, Chat, Close, Delete } from '@mui/icons-material/';
import { useTheme } from '@mui/material/styles';

const MainContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    fontFamily: theme.typography.applyFontFamily('primary').fontFamily,
}));

const DocumentCard = ({ document }) => {
    const { deleteDocument } = useContext(ProjectContext);
    console.log(document);
    const handleDelete = () => {
        deleteDocument(document.project_id, document.id);
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
            <CardHeader title="Document Source" subheader={document.source} />
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
                    }}
                >
                    <Typography variant="body1">{document.value}</Typography>
                </Box>
            </CardContent>
            <CardActions>
                <StyledIconButton onClick={handleDelete}>
                    <Delete />
                </StyledIconButton>
            </CardActions>
        </Card>
    );
};

const Project = ({ project, onClose }) => {
    const {
        isWebScrapeOpen,
        setIsWebScrapeOpen,
        isChatOpen,
        setIsChatOpen,
        documentArray,
        fetchDocuments,
    } = useContext(ProjectContext);
    const { getAgentById } = useContext(ChatContext);
    const { idToken } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const agent = getAgentById(project.id);
    const theme = useTheme();

    useEffect(() => {
        fetchDocuments(project.id);
    }, []);
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectName', project.name);
        formData.append('projectId', project.id);

        try {
            const response = await fetch(
                'http://localhost:50006/projects/extract',
                {
                    method: 'POST',
                    headers: {
                        Authorization: idToken,
                    },
                    body: formData,
                }
            );

            if (!response.ok) throw new Error('Failed to upload file');

            // Handle successful response
            console.log('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleExtractFileClick = () => {
        fileInputRef.current.click();
    };

    return (
        <MainContainer>
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                alignItems="center"
                padding={2}
                sx={{ width: '100%', height: '100%' }}
                onClick={(e) => e.stopPropagation()}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        left: 60,
                        zIndex: 2000,
                    }}
                >
                    <StyledIconButton
                        aria-label="Close fullscreen"
                        sx={{ color: 'white' }}
                        onClick={onClose}
                    >
                        <Close />
                    </StyledIconButton>
                </Box>
                <Typography
                    fontFamily={
                        theme.typography.applyFontFamily('title').fontFamily
                    }
                    variant="h2"
                    fontWeight={'medium'}
                >
                    {project.name}
                </Typography>
                <Typography
                    fontFamily={
                        theme.typography.applyFontFamily('primary').fontFamily
                    }
                    variant="body"
                >
                    {project.description}
                </Typography>
                <Box
                    display="flex"
                    flexDirection="row"
                    gap={2}
                    justifyContent="center"
                    width="100%"
                >
                    <StyledIconButton
                        onClick={() => setIsWebScrapeOpen(!isWebScrapeOpen)}
                        aria-label="Scrape Web"
                    >
                        <WebAsset />
                    </StyledIconButton>
                    <StyledIconButton
                        onClick={handleExtractFileClick}
                        aria-label="Extract Document"
                    >
                        <FileCopy />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </StyledIconButton>
                    <StyledIconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsChatOpen(!isChatOpen);
                        }}
                        aria-label="Chat"
                    >
                        <Chat />
                    </StyledIconButton>
                </Box>
                {isWebScrapeOpen ? (
                    <WebScrapeForm
                        projectName={project.name}
                        projectId={project.id}
                    />
                ) : null}
                {isChatOpen ? <ProjectChat agent={agent} /> : null}
                <Grid container spacing={2} justifyContent="center">
                    {documentArray[project.id]?.map((document) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            xl={3}
                            key={document.id}
                        >
                            <DocumentCard document={document} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </MainContainer>
    );
};

export default Project;
