import { useContext, useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { ProjectContext } from './ProjectContext';
import ProjectSpeedDial from './ProjectSpeedDial';
import Project from './Project';
import NewProject from './NewProject';

const ProjectCard = ({ project, onSelect }) => (
    <Card sx={{ width: '100%' }} onClick={onSelect}>
        <CardContent>
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                alignItems="center"
                padding={2}
            >
                <Typography variant="h4" sx={{ whiteSpace: 'nowrap' }}>
                    {project.name}
                </Typography>
                <Typography variant="body1">{project.description}</Typography>
            </Box>
        </CardContent>
    </Card>
);

const ProjectsDash = () => {
    const { projects, isNewProjectOpen, setIsNewProjectOpen } =
        useContext(ProjectContext);
    const [selectedProject, setSelectedProject] = useState(null);

    const handleCloseNewProject = () => {
        setIsNewProjectOpen(false);
    };

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
                alignItems: 'center',
                flexDirection: 'column',
                width: '90vw',
                height: '90vh',
            }}
            gap={6}
        >
            {projects &&
                projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onSelect={() => setSelectedProject(project)}
                    />
                ))}

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
