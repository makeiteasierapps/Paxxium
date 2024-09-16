import { useContext, useEffect } from 'react';
import { KbContext } from '../../../contexts/KbContext';
import KbUtility from './KbUtlity';
import KbDocCard from './KbDocCard';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import { Box, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { StyledContainer } from '../../styledComponents/DashStyledComponents';
import { Close } from '@mui/icons-material';

const KbMain = ({ onClose }) => {
    const { selectedKb, kbDocs, fetchKbDocs } = useContext(KbContext);

    const theme = useTheme();

    useEffect(() => {
        fetchKbDocs(selectedKb.id);
    }, [fetchKbDocs, selectedKb.id]);

    return (
        <StyledContainer
            sx={{
                height: '90vh',
                position: 'relative',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
                <StyledIconButton
                    aria-label="Close fullscreen"
                    sx={{ color: 'white' }}
                    onClick={onClose}
                >
                    <Close />
                </StyledIconButton>
            </Box>

            <Box sx={{ padding: '40px 20px 20px', textAlign: 'center' }}>
                <Typography
                    fontFamily={
                        theme.typography.applyFontFamily('title').fontFamily
                    }
                    variant="h2"
                    fontWeight="bold"
                    sx={{
                        mb: 2,
                        fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                        color: theme.palette.primary.main,
                    }}
                >
                    {selectedKb.name}
                </Typography>
                <Typography
                    fontFamily={
                        theme.typography.applyFontFamily('primary').fontFamily
                    }
                    variant="body1"
                    sx={{
                        mb: 4,
                        maxWidth: '800px',
                        margin: '0 auto',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        color: theme.palette.text.secondary,
                    }}
                >
                    {selectedKb.objective}
                </Typography>
            </Box>
            <Box sx={{ width: '100%', height: '100px', mb: 3, px: 2 }}>
                <KbUtility />
            </Box>
            <Box sx={{ padding: '0 20px', flexGrow: 1, overflowY: 'auto' }}>
                <Grid container spacing={2}>
                    {kbDocs[selectedKb.id]?.map((document) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            xl={3}
                            key={document.id}
                        >
                            <KbDocCard document={document} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </StyledContainer>
    );
};

export default KbMain;
