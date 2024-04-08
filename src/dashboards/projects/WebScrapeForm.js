import { useState, useContext } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { TextField, Box } from '@mui/material';
import { AuthContext } from '../../auth/AuthContext';
import { SettingsSubmitButton } from '../agents/agentStyledComponents';

const WebScrapeForm = ({ projectName, projectId }) => {
    const { idToken } = useContext(AuthContext);
    const [urls, setUrls] = useState('');
    const handleScrapeRequest = async () => {
        // Inside the handleScrapeRequest function
        const urlsArray = urls
            .split(',')
            .map((url) => url.trim())
            .filter((url) => url); // Split by comma, trim spaces, and filter out empty strings
        const formattedUrls = urlsArray.map((url) => {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return 'https://' + url; // Default to http if no protocol is specified
            }
            return url;
        });
        const response = await fetch('http://localhost:50006/projects/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify({
                urls: formattedUrls,
                projectName,
                projectId,
            }),
        });

        if (!response.ok) throw new Error('Failed to scrape url');

        setUrls('');

        // Handle response
        // Update the state to include the new data
        // Update local storage
    };

    return (
        <Box
            onClick={(e) => e.stopPropagation()}
            display="flex"
            flexDirection="column"
            width="60%"
        >
            <TextField
                label="URLs, comma separated"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                fullWidth
                margin="normal"
            />
            <SettingsSubmitButton
                disabled={!urls}
                onClick={handleScrapeRequest}
                endIcon={<SendIcon />}
            >
                Submit
            </SettingsSubmitButton>
        </Box>
    );
};

export default WebScrapeForm;
