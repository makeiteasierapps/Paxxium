import { useContext, useRef, useEffect, useState } from 'react';
import { styled } from '@mui/system';
import { KbContext } from '../../../contexts/KbContext';
import { AuthContext } from '../../../contexts/AuthContext';
import WebScrapeForm from './WebScrapeForm';
import EmbeddedDocCard from './EmbeddedDocCard';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import { Box, Typography, Grid } from '@mui/material';
import { WebAsset, FileCopy, Close, TextFields } from '@mui/icons-material/';
import { useTheme } from '@mui/material/styles';

const MainContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    fontFamily: theme.typography.applyFontFamily('primary').fontFamily,
}));

const KbMain = ({ onClose }) => {
    const { selectedKb, embeddedDocs, fetchEmbeddedDocs } =
        useContext(KbContext);
    const { uid } = useContext(AuthContext);
    const [isWebScrapeOpen, setIsWebScrapeOpen] = useState(false);
    const [isTextFieldsOpen, setIsTextFieldsOpen] = useState(false);
    const fileInputRef = useRef(null);

    const theme = useTheme();

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    useEffect(() => {
        fetchEmbeddedDocs(selectedKb.id);
    }, [fetchEmbeddedDocs, selectedKb.id]);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('kbName', selectedKb.name);
        formData.append('kbId', selectedKb.id);

        try {
            const response = await fetch(`${backendUrl}/kb/extract`, {
                method: 'POST',
                body: formData,
                headers: {
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
                },
            });

            if (!response.ok) throw new Error('Failed to upload file');

            const data = await response.json();
            console.log(data.content);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleExtractFileClick = () => {
        fileInputRef.current.click();
    };

    return (
        <MainContainer>
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                alignItems="center"
                padding={2}
                sx={{ width: '100%', height: '100%' }}
                onClick={(e) => e.stopPropagation()}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        left: 60,
                        zIndex: 2000,
                    }}
                >
                    <StyledIconButton
                        aria-label="Close fullscreen"
                        sx={{ color: 'white' }}
                        onClick={onClose}
                    >
                        <Close />
                    </StyledIconButton>
                </Box>
                <Typography
                    fontFamily={
                        theme.typography.applyFontFamily('title').fontFamily
                    }
                    variant="h2"
                    fontWeight={'medium'}
                >
                    {selectedKb.name}
                </Typography>
                <Typography
                    fontFamily={
                        theme.typography.applyFontFamily('primary').fontFamily
                    }
                    variant="body"
                >
                    {selectedKb.objective}
                </Typography>
                <Box
                    display="flex"
                    flexDirection="row"
                    gap={2}
                    justifyContent="center"
                    width="100%"
                >
                    <StyledIconButton
                        onClick={() => {
                            setIsTextFieldsOpen(!isTextFieldsOpen);
                            setIsWebScrapeOpen(false);
                        }}
                        aria-label="Scrape Web"
                    >
                        <TextFields />
                    </StyledIconButton>
                    <StyledIconButton
                        onClick={() => {
                            setIsWebScrapeOpen(!isWebScrapeOpen);
                            setIsTextFieldsOpen(false);
                        }}
                        aria-label="Scrape Web"
                    >
                        <WebAsset />
                    </StyledIconButton>
                    <StyledIconButton
                        onClick={handleExtractFileClick}
                        aria-label="Extract Document"
                    >
                        <FileCopy />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </StyledIconButton>
                </Box>
                {isWebScrapeOpen ? (
                    <WebScrapeForm
                        kbName={selectedKb.name}
                        kbId={selectedKb.id}
                    />
                ) : null}
            </Box>
            <Grid container spacing={2} justifyContent="center">
                {embeddedDocs[selectedKb.id]?.map((document) => (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        xl={3}
                        key={document.id}
                    >
                        <EmbeddedDocCard document={document} />
                    </Grid>
                ))}
            </Grid>
        </MainContainer>
    );
};

export default KbMain;
