import { useContext, useRef } from 'react';
import { styled } from '@mui/system';
import { ProjectContext } from './ProjectContext';
import { ChatContext } from '../agents/chat/ChatContext';
import { AuthContext } from '../../auth/AuthContext';
import WebScrapeForm from './WebScrapeForm';
import ProjectChat from '../agents/chat/Chat';
import { StyledIconButton } from '../agents/agentStyledComponents';
import { Box, Typography } from '@mui/material';
import { WebAsset, FileCopy, Chat, Close } from '@mui/icons-material/';

const MainContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
}));

const Project = ({ project, onClose }) => {
    const { isWebScrapeOpen, setIsWebScrapeOpen, isChatOpen, setIsChatOpen } =
        useContext(ProjectContext);
    const { getAgentById } = useContext(ChatContext);
    const { idToken } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const agent = getAgentById(project.id);
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
                <Typography variant="h3">{project.name}</Typography>
                <Typography variant="body1">{project.description}</Typography>
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
                        projectId={project._id}
                    />
                ) : null}
                {isChatOpen ? <ProjectChat agent={agent} /> : null}
            </Box>
        </MainContainer>
    );
};

export default Project;
