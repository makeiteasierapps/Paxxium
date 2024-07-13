import { useContext } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { ProjectContext } from '../../contexts/ProjectContext';
import ProjectSpeedDial from './components/ProjectSpeedDial';
import ProjectCard from './components/ProjectCard';
import Project from './components/Project';
import NewProject from './components/NewProject';
import { useTheme } from '@mui/material/styles';

const ProjectsDash = () => {
    const {
        projectManager: { projects, isNewProjectOpen },
        selectedProject,
        setSelectedProject,
    } = useContext(ProjectContext);

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

export default ProjectsDash;
