import { Box, styled } from '@mui/material';

export const MainContainer = styled(Box, {
    shouldForwardProp: (prop) => !['sx'].includes(prop),
})(({ theme, sx }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    minHeight: '90vh',
    margin: '0 auto',
    ...(sx || {}),
}));

export const StyledContainer = styled(Box, {
    shouldForwardProp: (prop) => !['sx'].includes(prop),
})(({ theme, sx }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '7px',
    boxShadow: `0px 0px 6px 2px ${theme.palette.primary.main}`,
    ...(sx || {}),
}));
