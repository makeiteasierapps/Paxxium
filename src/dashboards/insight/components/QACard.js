import { useState, useContext } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Collapse,
    IconButton,
    TextField,
    Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReactCardFlip from 'react-card-flip';
import { InsightContext } from '../../../contexts/InsightContext';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import { ProfileTextField } from '../../userAccount/styledUserAccountComponents';

const StyledCard = styled(Card)(({ theme }) => ({
    flex: '1 1 calc(33.333% - 16px)',
    maxWidth: 350,
    minWidth: 200,
    height: 200,
    backgroundColor: theme.palette.background.dark,
    color: theme.palette.common.white,
    cursor: 'pointer',
    boxSizing: 'border-box',
    [theme.breakpoints.down('sm')]: {
        flex: '1 1 100%',
        height: 160,
        maxWidth: '100%',
    },
    [theme.breakpoints.down('md')]: {
        flex: '1 1 100%',
        height: 160,
        maxWidth: 500,
    },
}));

const QACard = ({ questionsData }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editedAnswer, setEditedAnswer] = useState('');

    const handleExpandClick = (index) => {
        setExpandedId(expandedId === index ? null : index);
    };

    const handleEditClick = (qa, index) => {
        setEditingId(index);
        setEditedAnswer(qa.answer);
    };

    const handleSaveEdit = () => {
        // TODO: Add logic to save the edited answer
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedAnswer('');
    };

    // Get all the Q&A pairs from the category
    const qaItems = Object.values(questionsData).flatMap((subCategory) =>
        Object.values(subCategory).flat()
    );

    return (
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
            {qaItems.map((qa, index) => (
                <Card
                    key={index}
                    sx={{
                        mb: 2,
                        backgroundColor: 'background.paper',
                        '&:hover': {
                            boxShadow: 3,
                        },
                    }}
                >
                    <CardContent>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                            onClick={() => handleExpandClick(index)}
                        >
                            <Typography variant="h6" component="div">
                                {qa.question}
                            </Typography>
                            <IconButton>
                                {expandedId === index ? (
                                    <KeyboardArrowUpIcon />
                                ) : (
                                    <KeyboardArrowDownIcon />
                                )}
                            </IconButton>
                        </Box>

                        <Collapse in={expandedId === index}>
                            <Box sx={{ mt: 2 }}>
                                {editingId === index ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                        }}
                                    >
                                        <TextField
                                            multiline
                                            rows={4}
                                            value={editedAnswer}
                                            onChange={(e) =>
                                                setEditedAnswer(e.target.value)
                                            }
                                            fullWidth
                                        />
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: 1,
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={handleCancelEdit}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleSaveEdit}
                                            >
                                                Save
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <Typography color="text.secondary">
                                            {qa.answer}
                                        </Typography>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(qa, index);
                                            }}
                                            sx={{ ml: 2 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </Collapse>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default QACard;
