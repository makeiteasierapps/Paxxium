import { useContext, useState } from 'react'; // Import useState
import { Box, TextField, Typography } from '@mui/material';
import { SettingsMenuButton } from '../agents/agentStyledComponents';
import { styled } from '@mui/system';
import { AuthContext } from '../../auth/AuthContext';

export const MainContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70vw',
    height: 'auto',
    flexDirection: 'column',
    boxShadow: `0px 0px 6px 2px ${theme.palette.primary.main}`,
}));

const NewProject = () => {
    const { idToken } = useContext(AuthContext);
    const [name, setName] = useState(''); // State for project name
    const [description, setDescription] = useState(''); // State for project description

    const handleCreateProject = async (name, description) => {
        const formData = JSON.stringify({ name, description });
        const create_project_response = await fetch(
            'http://localhost:50006/projects/create',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: formData,
            }
        );

        if (!create_project_response.ok) {
            throw new Error('Failed to create project');
        }
        const data = await create_project_response.json();
        console.log(data);

        const creat_chat_response = await fetch(
            'http://localhost:50001/chat/create',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify({
                    chatName: data.project_name,
                    agentModel: 'Project',
                    systemPrompt: '',
                    chatConstants: '',
                    useProfileData: false,
                    projectId: data.project_id,
                }),
            }
        );

        if (!creat_chat_response.ok) {
            throw new Error('Failed to create project chat');
        }
        setName('');
        setDescription('');

        // add the new project to state
    };

    return (
        <MainContainer gap={2}>
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                alignItems="center"
                padding={2}
            >
                <Typography variant="h3">Create a New Project</Typography>
                <TextField
                    label="Project Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Project Description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                />
                <SettingsMenuButton
                    onClick={() => handleCreateProject(name, description)}
                >
                    Create Project
                </SettingsMenuButton>
            </Box>
        </MainContainer>
    );
};

export default NewProject;
