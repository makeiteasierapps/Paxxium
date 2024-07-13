import { useContext } from 'react';
import { Box, Typography, Card, CardContent, CardActions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Delete } from '@mui/icons-material';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import { KbContext } from '../../../contexts/KbContext';

const KbCard = ({ project, onSelect }) => {
    const theme = useTheme();
    const {
        projectManager: { deleteProject },
    } = useContext(KbContext);
    const handleDeleteProject = () => {
        deleteProject(project.id);
    };
    return (
        <Card
            sx={{
                width: '100%',
                backgroundColor: '#111111',
                cursor: 'pointer',
                '&:hover': {
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
                        {project.objective}
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

export default KbCard;
