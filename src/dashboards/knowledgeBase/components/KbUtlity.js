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

const KbUtility = ({ kbId }) => {
    const [url, setUrl] = useState('');
    const [crawl, setCrawl] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [kbDoc, setKbDoc] = useState(null);
    const { scrapeUrl, selectedKb, extractFile } = useContext(KbContext);

    const fileInputRef = useRef(null);

    const handleScrapeRequest = async () => {
        const trimmedUrl = url.trim();
        if (!trimmedUrl) return;
        const formattedUrl =
            trimmedUrl.startsWith('http://') ||
            trimmedUrl.startsWith('https://')
                ? trimmedUrl
                : 'https://' + trimmedUrl;
        const scrapedKbDoc = await scrapeUrl(kbId, formattedUrl, crawl);
        setKbDoc(scrapedKbDoc);
        setUrl('');
        setIsEditorOpen(true);
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('kbName', selectedKb.name);
        formData.append('kbId', selectedKb.id);

        const extractedKbDoc = await extractFile(formData, kbId);
        setKbDoc(extractedKbDoc);
        setIsEditorOpen(true);
    };

    const toggleEditor = () => {
        setIsEditorOpen(!isEditorOpen);
        if (!isEditorOpen) {
            setKbDoc(null);
        }
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
                <TextEditor
                    open={isEditorOpen}
                    onClose={toggleEditor}
                    doc={kbDoc}
                    urls={kbDoc.urls}
                    source={kbDoc.source}
                />
            )}
        </Box>
    );
};

export default KbUtility;
