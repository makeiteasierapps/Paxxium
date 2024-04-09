import { useContext, useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { ProjectContext } from './ProjectContext';
import ProjectSpeedDial from './ProjectSpeedDial';
import { StyledIconButton } from '../agents/agentStyledComponents';
import Project from './Project';
import NewProject from './NewProject';
import { useTheme } from '@mui/material/styles';

const ProjectCard = ({ project, onSelect }) => {
    const theme = useTheme();
    const { deleteProject } = useContext(ProjectContext);
    const handleDeleteProject = () => {
        deleteProject(project.id);
    };
    return (
        <Card
            sx={{
                width: '100%',
                backgroundColor: '#111111',
                cursor: 'pointer', // Changes the cursor to a pointer on hover
                '&:hover': {
                    // Optional: Add additional styles for hover state if needed
                    opacity: 0.9, // Example: Slightly reduce opacity on hover
                },
            }}
            onClick={onSelect}
            elevation={6}
        >
            <CardContent>
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    alignItems="center"
                    padding={2}
                >
                    <Typography
                        variant="h4"
                        fontFamily={
                            theme.typography.applyFontFamily('primary')
                                .fontFamily
                        }
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        {project.name}
                    </Typography>
                    <Typography
                        variant="body1"
                        fontFamily={
                            theme.typography.applyFontFamily('primary')
                                .fontFamily
                        }
                        color="primary"
                    >
                        {project.description}
                    </Typography>
                </Box>
            </CardContent>
            <CardActions>
                <StyledIconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject();
                    }}
                >
                    <Delete />
                </StyledIconButton>
            </CardActions>
        </Card>
    );
};

const ProjectsDash = () => {
    const { projects, isNewProjectOpen, setIsNewProjectOpen } =
        useContext(ProjectContext);
    const [selectedProject, setSelectedProject] = useState(null);

    const handleCloseNewProject = () => {
        setIsNewProjectOpen(false);
    };

    const theme = useTheme();

    if (selectedProject) {
        return (
            <Project
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%', // Adjusted for full width
                height: 'auto', // Adjusted for variable content height
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
                            {' '}
                            {/* Adjust grid item for responsive layout */}
                            <ProjectCard
                                project={project}
                                onSelect={() => setSelectedProject(project)}
                            />
                        </Grid>
                    ))}
            </Grid>

            {isNewProjectOpen && (
                <NewProject
                    isOpen={isNewProjectOpen}
                    onClose={handleCloseNewProject}
                />
            )}
            <ProjectSpeedDial isNewProjectOpen={isNewProjectOpen} />
        </Box>
    );
};

export default ProjectsDash;
