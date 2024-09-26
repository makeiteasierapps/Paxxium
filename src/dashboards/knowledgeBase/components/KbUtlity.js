import { useState, useContext, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import {
    TextField,
    Box,
    Checkbox,
    FormControlLabel,
    Button,
    InputAdornment,
} from '@mui/material';
import { KbContext } from '../../../contexts/KbContext';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import TextEditor from './textEditor/TextEditor';

const KbUtility = () => {
    const [url, setUrl] = useState('');
    const [crawl, setCrawl] = useState(false);
    const {
        scrapeUrl,
        selectedKb,
        extractFile,
        isEditorOpen,
        toggleEditor,
        setKbDoc,
    } = useContext(KbContext);

    const fileInputRef = useRef(null);

    const handleScrapeRequest = async () => {
        const trimmedUrl = url.trim();
        if (!trimmedUrl) return;
        const formattedUrl =
            trimmedUrl.startsWith('http://') ||
            trimmedUrl.startsWith('https://')
                ? trimmedUrl
                : 'https://' + trimmedUrl;
        const scrapedKbDoc = await scrapeUrl(
            selectedKb.id,
            formattedUrl,
            crawl
        );
        setKbDoc(scrapedKbDoc);
        setUrl('');
        toggleEditor();
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('kbId', selectedKb.id);

        const extractedKbDoc = await extractFile(formData, selectedKb.id);
        setKbDoc(extractedKbDoc);
        toggleEditor();
    };

    return (
        <Box
            onClick={(e) => e.stopPropagation()}
            display="flex"
            flexDirection="column"
        >
            <TextField
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <StyledIconButton
                                disableRipple
                                onClick={() => fileInputRef.current.click()}
                            >
                                <AddIcon />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                            </StyledIconButton>
                            <StyledIconButton
                                disabled={!url}
                                disableRipple
                                onClick={handleScrapeRequest}
                            >
                                <SendIcon />
                            </StyledIconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
            >
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={crawl}
                            onChange={(e) => setCrawl(e.target.checked)}
                            name="crawl"
                        />
                    }
                    label="Crawl Site"
                />
                <Button onClick={toggleEditor}>Open Editor</Button>
            </Box>
            {isEditorOpen && (
                <TextEditor open={isEditorOpen} onClose={toggleEditor} />
            )}
        </Box>
    );
};

export default KbUtility;
