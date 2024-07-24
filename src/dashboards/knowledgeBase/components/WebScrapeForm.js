import { useState, useContext } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { TextField, Box, Switch, FormControlLabel } from '@mui/material';
import { KbContext } from '../../../contexts/KbContext';
import { SettingsSubmitButton } from '../../chat/chatStyledComponents';

const WebScrapeForm = ({ kbName, kbId }) => {
    const { scrapeUrl } = useContext(KbContext);
    const [url, setUrl] = useState('');
    const [crawl, setCrawl] = useState(false);

    const handleScrapeRequest = async () => {
        const trimmedUrl = url.trim(); // Get the single URL and trim spaces
        if (!trimmedUrl) return; // Exit if the URL is empty
        const formattedUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') 
            ? trimmedUrl 
            : 'https://' + trimmedUrl; 
        scrapeUrl(kbId, kbName, formattedUrl, crawl); 
        setUrl('');
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
            <FormControlLabel
                control={
                    <Switch
                        checked={crawl}
                        onChange={(e) => setCrawl(e.target.checked)}
                        name="crawl"
                    />
                }
                label="Crawl Entire Site"
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
