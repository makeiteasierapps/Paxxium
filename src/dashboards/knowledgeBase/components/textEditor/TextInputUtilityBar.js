import { useContext } from 'react';
import { Typography, Tooltip } from '@mui/material';
import { Close, ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { StyledIconButton } from '../../../chat/chatStyledComponents';

import { KbContext } from '../../../../contexts/KbContext';

const MainUtilityBox = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: theme.spacing(1, 2),
}));

const NavigationContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const URLContainer = styled('div')({
    flex: 1,
    margin: '0 16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const TextInputUtilityBar = ({
    onClose,
    currentUrlIndex,
    setCurrentUrlIndex,
    urls,
    source,
}) => {
    const {
        textEditorManager: { removeDocumentDetails },
    } = useContext(KbContext);

    const handlePrevUrl = () => {
        setCurrentUrlIndex((prevIndex) =>
            prevIndex < urls.length - 1 ? prevIndex + 1 : 0
        );
    };

    const handleNextUrl = () => {
        setCurrentUrlIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : urls.length - 1
        );
    };

    return (
        <MainUtilityBox>
            <StyledIconButton
                onClick={() => {
                    removeDocumentDetails();
                    onClose();
                }}
            >
                <Close />
            </StyledIconButton>

            <URLContainer>
                <Tooltip title={source}>
                    <Typography variant="body2" noWrap>
                        {source}
                    </Typography>
                </Tooltip>
            </URLContainer>

            {urls && (
                <NavigationContainer>
                    <StyledIconButton onClick={handlePrevUrl}>
                        <ArrowBackIosNew />
                    </StyledIconButton>
                    <Typography variant="body2" sx={{ mx: 1 }}>
                        {`${urls.length - currentUrlIndex} / ${urls.length}`}
                    </Typography>
                    <StyledIconButton onClick={handleNextUrl}>
                        <ArrowForwardIos />
                    </StyledIconButton>
                </NavigationContainer>
            )}
        </MainUtilityBox>
    );
};

export default TextInputUtilityBar;
