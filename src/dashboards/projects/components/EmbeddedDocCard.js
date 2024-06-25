import { useContext } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardHeader,
    CardActions,
} from '@mui/material';
import { Delete } from '@mui/icons-material/';
import { ProjectContext } from '../ProjectContext';
import { StyledIconButton } from '../../agents/agentStyledComponents';

const EmbeddedDocCard = ({ document }) => {
    const {
        embeddedDocsManager: { deleteEmbeddedDoc },
    } = useContext(ProjectContext);

    const handleDelete = () => {
        deleteEmbeddedDoc(document.project_id, document.id);
    };

    return (
        <Card
            sx={{
                width: '100%',
                height: '500px',
                backgroundColor: '#111111',
            }}
            elevation={6}
        >
            <CardHeader title="Document Source" subheader={document.source} />
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        padding: 2,
                        height: '300px',
                        overflow: 'auto',
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1,
                    }}
                >
                    <Typography variant="body1">{document.content}</Typography>
                </Box>
            </CardContent>
            <CardActions>
                <StyledIconButton onClick={handleDelete}>
                    <Delete />
                </StyledIconButton>
            </CardActions>
        </Card>
    );
};

export default EmbeddedDocCard;
