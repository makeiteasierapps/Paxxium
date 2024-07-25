import { useContext, useEffect, useState } from 'react';
import { styled } from '@mui/system';
import { KbContext } from '../../../contexts/KbContext';
import KbUtility from './KbUtlity';
import EmbeddedDocCard from './EmbeddedDocCard';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import { Box, Typography, Grid } from '@mui/material';
import { WebAsset, Close } from '@mui/icons-material/';
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

    const [isWebScrapeOpen, setIsWebScrapeOpen] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        fetchEmbeddedDocs(selectedKb.id);
    }, [fetchEmbeddedDocs, selectedKb.id]);

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
                            setIsWebScrapeOpen(!isWebScrapeOpen);
                        }}
                        aria-label="Scrape Web"
                    >
                        <WebAsset />
                    </StyledIconButton>
                </Box>
                {isWebScrapeOpen ? (
                    <KbUtility kbName={selectedKb.name} kbId={selectedKb.id} />
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
