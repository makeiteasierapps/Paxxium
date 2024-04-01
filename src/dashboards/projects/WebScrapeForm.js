import { useState, useContext } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { TextField, Box } from '@mui/material';
import { AuthContext } from '../../auth/AuthContext';
import { SettingsSubmitButton } from '../agents/agentStyledComponents';

const WebScrapeForm = ({ projectName, projectId }) => {
    const { idToken } = useContext(AuthContext);
    const [url, setUrl] = useState('');
    const handleScrapeRequest = async () => {
        let formattedUrl = url;
        if (
            !formattedUrl.startsWith('http://') &&
            !formattedUrl.startsWith('https://')
        ) {
            formattedUrl = 'http://' + formattedUrl; // Default to http if no protocol is specified
        }
        const response = await fetch('http://localhost:50006/projects/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify({ url: formattedUrl, projectName, projectId }),
        });

        if (!response.ok) throw new Error('Failed to scrape url');

        setUrl('');

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
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                margin="normal"
            />
            <SettingsSubmitButton
                disabled={!url}
                onClick={handleScrapeRequest}
                endIcon={<SendIcon />}
            >
                Submit
            </SettingsSubmitButton>
        </Box>
    );
};

export default WebScrapeForm;
