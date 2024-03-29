import { useState, useContext } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { TextField, Box } from '@mui/material';
import { AuthContext } from '../../auth/AuthContext';
import { SettingsSubmitButton } from '../agents/agentStyledComponents';

const WebScrapeForm = ({ projectName }) => {
    const { idToken } = useContext(AuthContext);
    const [url, setUrl] = useState('');
    const [query, setQuery] = useState('');
    const handleScrapeRequest = async () => {
        const response = await fetch('http://localhost:50006/project/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify({ url, query }),
        });

        if (!response.ok) throw new Error('Failed to scrape url');

        setUrl('');
        setQuery('');

        // Handle response
    };

    return (
        <Box onClick={(e) => e.stopPropagation()}>
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
                onClick={() => handleScrapeRequest(projectName)}
                endIcon={<SendIcon />}
            >
                Submit
            </SettingsSubmitButton>
        </Box>
    );
};

export default WebScrapeForm;
