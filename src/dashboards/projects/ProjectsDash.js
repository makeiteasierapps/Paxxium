import { useContext, useState, useRef } from 'react';
import { Box, TextField } from '@mui/material';
import {
    SettingsSubmitButton,
    StyledIconButton,
} from '../agents/agentStyledComponents';
import SendIcon from '@mui/icons-material/Send';

import { AuthContext } from '../../auth/AuthContext';
import ProjectSpeedDial from './ProjectSpeedDial';

const WebScrapeTextField = () => {
    const { idToken } = useContext(AuthContext);
    const [url, setUrl] = useState('');
    const [query, setQuery] = useState('');
    const handleScrapeRequest = async () => {
        // Modified to not take url as parameter
        const response = await fetch('http://localhost:50006/project/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify({ url, query }), // Now sending both url and data
        });

        if (!response.ok) throw new Error('Failed to scrape url');

        setUrl('');
        setQuery(''); // Resetting the new input field as well

        // Handle response
    };

    return (
        <>
            <TextField
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
                margin="normal"
            />
            <SettingsSubmitButton
                disabled={!url || !query}
                onClick={handleScrapeRequest}
                endIcon={<SendIcon />}
            >
                Submit
            </SettingsSubmitButton>
        </>
    );
};

const ProjectsDash = () => {
    const [isWebScrapeOpen, setIsWebScrapeOpen] = useState(false);
    const [isExtractFileOpen, setIsExtractFileOpen] = useState(false);
    const { idToken } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

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
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                height: '100vh',
            }}
        >
            {isWebScrapeOpen && <WebScrapeTextField />}
            {isExtractFileOpen && (
                <>
                    <StyledIconButton onClick={handleExtractFileClick}>
                        Extract File
                    </StyledIconButton>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }} // Hide the file input
                    />
                </>
            )}
            <ProjectSpeedDial
                setIsWebScrapeOpen={setIsWebScrapeOpen}
                isWebScrapeOpen={isWebScrapeOpen}
                setIsExtractFileOpen={setIsExtractFileOpen}
                isExtractFileOpen={isExtractFileOpen}
            />
        </Box>
    );
};

export default ProjectsDash;
