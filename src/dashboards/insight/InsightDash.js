import { useContext, useState } from 'react';
import {
    CircularProgress,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
} from '@mui/material';
import QuestionHub from './components/QuestionsHub';
import { MainContainer } from '../styledComponents/DashStyledComponents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GenerateQuestionsForm from './components/GenerateQuestionsForm';
import { ProfileContext } from '../../contexts/ProfileContext';
import { StyledIconButton } from '../chat/chatStyledComponents';

const InsightDash = () => {
    const { isQuestionsFormOpen, isGraphOpen, isLoading } =
        useContext(ProfileContext);
    const [isHelpOpen, setHelpOpen] = useState(false);

    const handleHelpOpen = () => setHelpOpen(true);
    const handleHelpClose = () => setHelpOpen(false);

    return (
        <MainContainer id="main-container">
            {isLoading ? (
                <CircularProgress />
            ) : (
                <>
                    {/* Header Section */}
                    <Box position="absolute" top={7} right={7} zIndex={1000}>
                        <StyledIconButton onClick={handleHelpOpen}>
                            <HelpOutlineIcon fontSize="small" />
                        </StyledIconButton>
                    </Box>

                    {!isQuestionsFormOpen && !isGraphOpen && (
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            sx={{ mb: 3, maxWidth: '800px' }}
                        >
                            Begin your journey of self-discovery and personal
                            development. Answer tailored questions about your
                            experiences and goals to receive personalized
                            insights and guidance.
                        </Typography>
                    )}

                    {isQuestionsFormOpen && <GenerateQuestionsForm />}
                    {isGraphOpen && <QuestionHub />}

                    {/* Help Dialog - Simplified Content */}
                    <Dialog
                        open={isHelpOpen}
                        onClose={handleHelpClose}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>How This Works</DialogTitle>
                        <DialogContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    1. <strong>Introduction:</strong> Share some
                                    basic information about yourself
                                </Typography>
                                <Typography variant="body1">
                                    2. <strong>Answer Questions:</strong>{' '}
                                    Respond to personalized questions about your
                                    background, goals, and experiences
                                </Typography>
                                <Typography variant="body1">
                                    3. <strong>Get Insights:</strong> Receive
                                    tailored suggestions and guidance for your
                                    personal development
                                </Typography>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleHelpClose} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </MainContainer>
    );
};

export default InsightDash;
