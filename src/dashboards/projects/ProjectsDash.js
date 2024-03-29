import { useContext } from 'react';
import { Box } from '@mui/material';
import { ProjectContext } from './ProjectContext';
import ProjectSpeedDial from './ProjectSpeedDial';
import Project from './Project';
import NewProject from './NewProject';

const ProjectsDash = () => {
    
    const { projects, isNewProjectOpen } =
        useContext(ProjectContext);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                width: '90vw',
                height: '100vh',
            }}
            gap={6}
        >
            {projects &&
                projects.map((project) => (
                    <Project key={project.id} project={project} />
                ))}

            {isNewProjectOpen && <NewProject />}
            <ProjectSpeedDial isNewProjectOpen={isNewProjectOpen} />
        </Box>
    );
};

export default ProjectsDash;
