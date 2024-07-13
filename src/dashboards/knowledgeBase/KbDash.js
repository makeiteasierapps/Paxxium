import { useContext } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { KbContext } from '../../contexts/KbContext';
import ProjectSpeedDial from './components/KbSpeedDial';
import ProjectCard from './components/KbCard';
import Project from './components/KbMain';
import NewProject from './components/NewKnowledgeBase';
import { useTheme } from '@mui/material/styles';

const KbDash = () => {
    const {
        projectManager: { projects, isNewProjectOpen },
        selectedProject,
        setSelectedProject,
    } = useContext(KbContext);

    const theme = useTheme();

    if (selectedProject) {
        return <Project onClose={() => setSelectedProject(null)} />;
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
                Projects
            </Typography>

            <Grid container spacing={2} justifyContent="center">
                {projects &&
                    projects.map((project) => (
                        <Grid item xs={12} sm={4} key={project.id}>
                            <ProjectCard
                                project={project}
                                onSelect={() => setSelectedProject(project)}
                            />
                        </Grid>
                    ))}
            </Grid>

            {isNewProjectOpen && <NewProject />}
            <ProjectSpeedDial />
        </Box>
    );
};

export default KbDash;
