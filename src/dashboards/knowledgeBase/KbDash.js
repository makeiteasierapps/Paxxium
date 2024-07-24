import { useContext } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { KbContext } from '../../contexts/KbContext';
import KbSpeedDial from './components/KbSpeedDial';
import KbHeading from './components/KbHeading';
import KbMain from './components/KbMain';
import NewKnowledgeBase from './components/NewKnowledgeBase';
import { useTheme } from '@mui/material/styles';

const KbDash = () => {
    const {
        kbManager: { kbArray, isNewKbOpen },
        selectedKb,
        setSelectedKb,
    } = useContext(KbContext);

    const theme = useTheme();

    if (selectedKb) {
        return <KbMain onClose={() => setSelectedKb(null)} />;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: 'auto',
                marginTop: 2,
                marginBottom: 2,
                gap: 4,
            }}
        >
            <Typography
                variant="h1"
                sx={{ textAlign: 'center', marginBottom: 4 }}
                fontFamily={
                    theme.typography.applyFontFamily('title').fontFamily
                }
                fontWeight="bold"
            >
                Knowledge Base
            </Typography>

            <Grid container spacing={2} justifyContent="center">
                {kbArray &&
                    kbArray.map((kb) => (
                        <Grid item xs={12} sm={4} key={kb.id}>
                            <KbHeading
                                kb={kb}
                                onSelect={() => setSelectedKb(kb)}
                            />
                        </Grid>
                    ))}
            </Grid>

            {isNewKbOpen && <NewKnowledgeBase />}
            <KbSpeedDial />
        </Box>
    );
};

export default KbDash;
