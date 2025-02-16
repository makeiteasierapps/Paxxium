import { useContext, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';
import UserProfileView from './components/UserProfileView';
import { MainContainer } from '../styledComponents/DashStyledComponents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { InsightContext } from '../../contexts/InsightContext';
import { StyledIconButton } from '../chat/chatStyledComponents';
import { ContextManagerProvider } from '../../contexts/ContextManagerContext';
import HelpDialog from './components/HelpDialog';
import SingleChat from '../chat/components/SingleChat';
const InsightDash = () => {
    const { insightUserData, isLoading, insightChat } =
        useContext(InsightContext);
    const [isHelpOpen, setHelpOpen] = useState(false);
    const handleHelpOpen = () => setHelpOpen(true);
    const handleHelpClose = () => setHelpOpen(false);

    return (
        <ContextManagerProvider type="insight">
            <MainContainer id="main-container">
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <>
                        <Box
                            position="absolute"
                            top={7}
                            right={7}
                            zIndex={1000}
                        >
                            <StyledIconButton onClick={handleHelpOpen}>
                                <HelpOutlineIcon fontSize="small" />
                            </StyledIconButton>
                        </Box>

                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={2}
                            height="90vh"
                        >
                            <UserProfileView
                                userInsight={insightUserData}
                            />
                            <SingleChat chat={insightChat} type="insight" />
                        </Box>

                        <HelpDialog
                            isHelpOpen={isHelpOpen}
                            handleHelpClose={handleHelpClose}
                        />
                    </>
                )}
            </MainContainer>
        </ContextManagerProvider>
    );
};

export default InsightDash;
