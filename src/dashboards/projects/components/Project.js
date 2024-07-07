import { useContext, useRef, useEffect, useState } from 'react';
import { styled } from '@mui/system';
import { ProjectContext } from '../ProjectContext';
import { ChatContext } from '../../agents/chat/ChatContext';
import WebScrapeForm from './WebScrapeForm';
import ProjectChat from '../../agents/chat/Chat';
import EmbeddedDocCard from './EmbeddedDocCard';
import TextDocumentMenu from './textEditor/TextDocumentMenu';
import { StyledIconButton } from '../../agents/agentStyledComponents';
import { Box, Typography, Grid } from '@mui/material';
import {
    WebAsset,
    FileCopy,
    Chat,
    Close,
    Source,
    TextFields,
} from '@mui/icons-material/';
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

// Need to look at how I am managing the state of ProjectChat
// I think I should move the state to be local so that each project manages its own chat
const Project = ({ onClose }) => {
    const {
        selectedProject,
        embeddedDocsManager: { embeddedDocs, fetchEmbeddedDocs },
    } = useContext(ProjectContext);

    const { getChatByProjectId } = useContext(ChatContext);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isWebScrapeOpen, setIsWebScrapeOpen] = useState(false);
    const [isDocumentOpen, setIsDocumentOpen] = useState(false);
    const [isTextFieldsOpen, setIsTextFieldsOpen] = useState(false);
    const fileInputRef = useRef(null);
    const agent = getChatByProjectId(selectedProject.id);
    const theme = useTheme();

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    useEffect(() => {
        fetchEmbeddedDocs(selectedProject.id);
    }, []);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectName', selectedProject.name);
        formData.append('projectId', selectedProject.id);

        try {
            const response = await fetch(`${backendUrl}/projects/extract`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload file');

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
                    {selectedProject.name}
                </Typography>
                <Typography
                    fontFamily={
                        theme.typography.applyFontFamily('primary').fontFamily
                    }
                    variant="body"
                >
                    {selectedProject.objective}
                </Typography>
                <Box
                    display="flex"
                    flexDirection="row"
                    gap={2}
                    justifyContent="center"
                    width="100%"
                >
                    <StyledIconButton
                        onClick={() => {
                            setIsTextFieldsOpen(!isTextFieldsOpen);
                            setIsWebScrapeOpen(false);
                            setIsDocumentOpen(false);
                            setIsChatOpen(false);
                        }}
                        aria-label="Scrape Web"
                    >
                        <TextFields />
                    </StyledIconButton>
                    <StyledIconButton
                        onClick={() => {
                            setIsWebScrapeOpen(!isWebScrapeOpen);
                            setIsDocumentOpen(false);
                            setIsChatOpen(false);
                            setIsTextFieldsOpen(false);
                        }}
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
                        onClick={() => {
                            setIsChatOpen(!isChatOpen);
                            setIsDocumentOpen(false);
                            setIsWebScrapeOpen(false);
                            setIsTextFieldsOpen(false);
                        }}
                        aria-label="Chat"
                    >
                        <Chat />
                    </StyledIconButton>
                    <StyledIconButton
                        onClick={() => {
                            setIsDocumentOpen(!isDocumentOpen);
                            setIsChatOpen(false);
                            setIsWebScrapeOpen(false);
                            setIsTextFieldsOpen(false);
                        }}
                        aria-label="Documents"
                    >
                        <Source />
                    </StyledIconButton>
                </Box>
                {isWebScrapeOpen ? (
                    <WebScrapeForm
                        projectName={selectedProject.name}
                        projectId={selectedProject.id}
                    />
                ) : null}
                {isChatOpen ? (
                    <ProjectChat agent={agent} setIsChatOpen={setIsChatOpen} />
                ) : null}
                {isDocumentOpen ? (
                    <Grid container spacing={2} justifyContent="center">
                        {embeddedDocs[selectedProject.id]?.map((document) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                xl={3}
                                key={document.id}
                            >
                                <EmbeddedDocCard document={document} />
                            </Grid>
                        ))}
                    </Grid>
                ) : null}
                {isTextFieldsOpen ? <TextDocumentMenu /> : null}
            </Box>
        </MainContainer>
    );
};

export default Project;
