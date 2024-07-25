import { useContext, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Modal,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material/';
import { KbContext } from '../../../contexts/KbContext';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import TextEditor from './textEditor/TextEditor';

const EmbeddedDocCard = ({ document }) => {
    const {
        deleteEmbeddedDoc,
        textEditorManager: { openTextEditor, handleClose, isTextEditorOpen },
    } = useContext(KbContext);

    const handleDelete = () => {
        deleteEmbeddedDoc(document.kb_id, document.id);
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
            <CardHeader
                title="Document Source"
                subheader={document.source}
                action={
                    document.source === 'user' ? (
                        <StyledIconButton
                            onClick={() => openTextEditor(document)}
                        >
                            <Add />
                        </StyledIconButton>
                    ) : null
                }
            />
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
            <Modal open={isTextEditorOpen} onClose={handleClose}>
                <Box>
                    <TextEditor document={document} onClose={handleClose} />
                </Box>
            </Modal>
        </Card>
    );
};

export default EmbeddedDocCard;
