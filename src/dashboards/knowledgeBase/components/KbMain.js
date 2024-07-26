import { useContext, useEffect, useState } from 'react';
import { styled } from '@mui/system';
import { motion, AnimatePresence } from 'framer-motion';
import { KbContext } from '../../../contexts/KbContext';
import KbUtility from './KbUtlity';
import EmbeddedDocCard from './EmbeddedDocCard';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import { Box, Typography, Grid } from '@mui/material';
import { ChevronRight, ChevronLeft, Close } from '@mui/icons-material/';
import { useTheme } from '@mui/material/styles';
import { StyledContainer } from '../../styledComponents/DashStyledComponents';

const MainContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    width: '100%',
    height: '90vh',
    fontFamily: theme.typography.applyFontFamily('primary').fontFamily,
}));

const ContentContainer = styled(Box)({
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflowY: 'auto',
});

const KbMain = ({ onClose }) => {
    const { selectedKb, embeddedDocs, fetchEmbeddedDocs } =
        useContext(KbContext);

    const [isUtilityOpen, setIsUtilityOpen] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        fetchEmbeddedDocs(selectedKb.id);
    }, [fetchEmbeddedDocs, selectedKb.id]);

    return (
        <MainContainer onClick={(e) => e.stopPropagation()}>
            <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
                <StyledIconButton
                    aria-label="Close fullscreen"
                    sx={{ color: 'white' }}
                    onClick={onClose}
                >
                    <Close />
                </StyledIconButton>
            </Box>

            <StyledContainer sx={{ mb: 3, height: '10vh' }}>
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
                    variant="body1"
                >
                    {selectedKb.objective}
                </Typography>
            </StyledContainer>

            <ContentContainer>
                <Box sx={{ flex: 1, padding: '20px', position: 'relative' }}>
                    <StyledIconButton
                        onClick={() => setIsUtilityOpen(!isUtilityOpen)}
                        aria-label={
                            isUtilityOpen ? 'Close utility' : 'Open utility'
                        }
                        sx={{
                            position: 'absolute',
                            top: 0,
                            zIndex: 11,
                        }}
                    >
                        {isUtilityOpen ? <ChevronLeft /> : <ChevronRight />}
                    </StyledIconButton>

                    <AnimatePresence>
                        <Box sx={{ width: '100%', height: '100px' }}>
                            {isUtilityOpen && (
                                <KbUtility
                                    kbName={selectedKb.name}
                                    kbId={selectedKb.id}
                                />
                            )}
                        </Box>
                    </AnimatePresence>

                    <Grid container spacing={2}>
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
                </Box>
            </ContentContainer>
        </MainContainer>
    );
};

export default KbMain;
