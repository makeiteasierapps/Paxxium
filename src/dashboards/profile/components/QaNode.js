import { useState, useContext } from 'react';
import { StyledContainer } from '../../styledComponents/DashStyledComponents';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { StyledIconButton } from '../../chat/chatStyledComponents';

const QaNode = ({ node, onClick, onNavigate }) => {
    const [answer, setAnswer] = useState('');
    const { updateAnswer } = useContext(ProfileContext);
    const handleSaveAnswer = (e, node) => {
        updateAnswer(node.id, answer);
    };

    return (
        <StyledContainer
            sx={{
                height: '30vh',
                width: '90vw',
                maxWidth: '700px',
                display: 'flex',
            }}
        >
            <StyledIconButton
                onClick={onClick}
                sx={{
                    position: 'absolute',
                    top: '1px',
                    left: '1px',
                    opacity: 0.5,
                }}
                aria-label="close"
            >
                <CloseIcon />
            </StyledIconButton>
            <StyledIconButton
                onClick={() => onNavigate('prev')}
                aria-label="previous question"
                sx={{
                    position: 'absolute',
                    bottom: '3px',
                    left: '1px',
                    opacity: 0.5,
                }}
            >
                <ArrowBackIosNewIcon />
            </StyledIconButton>
            <StyledIconButton
                sx={{
                    position: 'absolute',
                    bottom: '3px',
                    right: '1px',
                    opacity: 0.5,
                }}
                onClick={() => onNavigate('next')}
                aria-label="next question"
            >
                <ArrowForwardIosIcon />
            </StyledIconButton>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            width: '80%',
                            textAlign: 'center',
                            fontFamily: 'Roboto, sans-serif',
                        }}
                    >
                        {node.name}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {node.answer ? (
                        <Typography
                            variant="body1"
                            sx={{
                                width: '80%',
                                textAlign: 'center',
                                fontFamily: 'Roboto, sans-serif',
                            }}
                        >
                            {node.answer}
                        </Typography>
                    ) : (
                        <Typography
                            variant="body1"
                            sx={{
                                width: '80%',
                                textAlign: 'center',
                                fontFamily: 'Roboto, sans-serif',
                                color: 'text.secondary',
                            }}
                        >
                            Pleas provide an answer or mark for edit
                        </Typography>
                    )}
                </Box>
                <TextField
                    autoFocus
                    variant="outlined"
                    value={answer}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <StyledIconButton
                                    disabled={!answer}
                                    disableRipple
                                    aria-label="answer input field"
                                    onClick={() => {
                                        handleSaveAnswer(answer, node);
                                        setAnswer('');
                                    }}
                                >
                                    <SendIcon />
                                </StyledIconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '40px',
                        },
                        marginBottom: '20px',
                        width: '90%',
                    }}
                    onChange={(e) => setAnswer(e.target.value)}
                />
            </Box>
        </StyledContainer>
    );
};

export default QaNode;
