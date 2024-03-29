import { useState, useContext, useRef } from 'react';
import { styled } from '@mui/system';
import { ProjectContext } from './ProjectContext';
import { AuthContext } from '../../auth/AuthContext';
import WebScrapeForm from './WebScrapeForm';
import { StyledIconButton } from '../agents/agentStyledComponents';
import { Box, Typography } from '@mui/material';
import { WebAsset, FileCopy, PlaylistAdd } from '@mui/icons-material/';

const MainContainer = styled(Box)(({ theme, fullscreen }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: fullscreen ? '100vw' : '30vw',
    height: fullscreen ? '100vh' : '30vw',
    flexDirection: 'column',
    boxShadow: `0px 0px 6px 2px ${theme.palette.primary.main}`,
    cursor: 'pointer',
    position: fullscreen ? 'absolute' : 'relative', // Ensure full screen covers the dashboard
    top: 0,
    left: 0,
    zIndex: fullscreen ? 1000 : 1, // Ensure it's above other content in full screen
}));

const Project = ({ project }) => {
    const {
        isWebScrapeOpen,
        setIsWebScrapeOpen,
        isExtractFileOpen,
        setIsExtractFileOpen,
    } = useContext(ProjectContext);
    const { idToken } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false); // State to manage full-screen mode
    const actions = [
        {
            icon: <WebAsset />,
            name: 'Scrape Web',
            setState: setIsWebScrapeOpen,
            state: isWebScrapeOpen,
        },
        {
            icon: <FileCopy />,
            name: 'Extract Document',
            setState: setIsExtractFileOpen,
            state: isExtractFileOpen,
        },
    ];

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectName', project.name);

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
        <MainContainer
            fullscreen={isFullscreen}
            onClick={() => setIsFullscreen(!isFullscreen)}
        >
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                alignItems="center"
                padding={2}
            >
                <Typography variant="h3">{project.name}</Typography>
                <Typography variant="body1">{project.description}</Typography>
                {isFullscreen &&
                    actions.map((action, index) => (
                        <StyledIconButton
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the fullscreen toggle
                                action.setState(!action.state);
                            }}
                            aria-label={action.name}
                        >
                            {action.icon}
                        </StyledIconButton>
                    ))}
                {isWebScrapeOpen && isFullscreen ? <WebScrapeForm /> : null}
                {isExtractFileOpen && isFullscreen ? (
                    <Box onClick={(e) => e.stopPropagation()}>
                        <StyledIconButton onClick={handleExtractFileClick}>
                            Extract File
                        </StyledIconButton>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </Box>
                ) : null}
            </Box>
        </MainContainer>
    );
};

export default Project;
