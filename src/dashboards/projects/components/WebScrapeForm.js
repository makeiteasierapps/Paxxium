import { useState, useContext } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { TextField, Box } from '@mui/material';
import { ProjectContext } from '../ProjectContext';
import { SettingsSubmitButton } from '../../agents/agentStyledComponents';

const WebScrapeForm = ({ projectName, projectId }) => {
    const { scrapeUrls } = useContext(ProjectContext);
    const [urls, setUrls] = useState('');

    const handleScrapeRequest = async () => {
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
        scrapeUrls(projectId, projectName, formattedUrls);
        setUrls('');
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
