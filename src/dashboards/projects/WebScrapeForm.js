import { useState, useContext } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { TextField, Box } from '@mui/material';
import { AuthContext } from '../../auth/AuthContext';
import { SettingsSubmitButton } from '../agents/agentStyledComponents';

const WebScrapeForm = ({ projectName, projectId }) => {
    const { idToken } = useContext(AuthContext);
    const [url, setUrl] = useState('');
    const handleScrapeRequest = async () => {
        const response = await fetch('http://localhost:50006/projects/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify({ url, projectName, projectId }),
        });

        if (!response.ok) throw new Error('Failed to scrape url');

        setUrl('');

        // Handle response
    };

    return (
        <Box onClick={(e) => e.stopPropagation()} display="flex" flexDirection="column" width="60%">
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
