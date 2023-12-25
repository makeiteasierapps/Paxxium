import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';

export const HeaderContainer = styled(({ permanentDrawerOpen, ...other }) => (
    <Box {...other} />
))(({ theme, permanentDrawerOpen }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: permanentDrawerOpen ? 'flex-end' : 'space-between',
    position: 'sticky',
    backgroundColor: theme.palette.background.paper,
    zIndex: 1000,
    top: 0,
}));

export const HeaderIconButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'currentPath',
})(({ theme, currentPath, to }) => ({
    color: to
        ? currentPath === to
            ? theme.palette.text.primary
            : theme.palette.text.secondary
        : theme.palette.text.secondary,
    fontSize: '10px',

    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
    },
}));
