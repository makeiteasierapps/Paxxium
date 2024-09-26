import { Typography, Tooltip } from '@mui/material';
import { Close, ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { StyledIconButton } from '../../../chat/chatStyledComponents';

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
    document,
    onClose,
    currentDocIndex,
    setCurrentDocIndex,
}) => {
    const handlePrevUrl = () => {
        setCurrentDocIndex((prevIndex) =>
            prevIndex < document.content.length - 1 ? prevIndex + 1 : 0
        );
    };

    const handleNextUrl = () => {
        setCurrentDocIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : document.content.length - 1
        );
    };

    return (
        <MainUtilityBox>
            <StyledIconButton onClick={onClose}>
                <Close />
            </StyledIconButton>

            <URLContainer>
                <Tooltip
                    title={document.content[currentDocIndex].metadata.sourceURL}
                >
                    <Typography variant="body2" noWrap>
                        {document.content[currentDocIndex].metadata.sourceURL}
                    </Typography>
                </Tooltip>
            </URLContainer>

            {document.content.length > 1 && (
                <NavigationContainer>
                    <StyledIconButton onClick={handlePrevUrl}>
                        <ArrowBackIosNew />
                    </StyledIconButton>
                    <Typography variant="body2" sx={{ mx: 1 }}>
                        {`${document.content.length - currentDocIndex} / ${
                            document.content.length
                        }`}
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
