import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';

export const HeaderContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'permanentDrawerOpen',
})(({ theme, permanentDrawerOpen }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    backgroundColor: theme.palette.background.default,
    zIndex: 1000,
    top: 0,
}));

export const HeaderIconButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'currentPath',
})(({ theme, currentPath, to }) => ({
    color: to
        ? currentPath === to ||
          (currentPath === '/' && to === '/home') ||
          (currentPath === '/dalle' && to === '/agents')
            ? theme.palette.text.secondary
            : theme.palette.text.primary
        : theme.palette.text.primary,
    fontSize: '10px',

    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.text.secondary,
    },
}));
