import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';

export const HeaderContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'permanentDrawerOpen',
})(({ theme, permanentDrawerOpen }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: permanentDrawerOpen ? 'flex-end' : 'space-between',
    position: 'sticky',
    backgroundColor: theme.palette.background.paper,
    zIndex: 1000,
    top: 0,
}));

// custom property 'currentPath'  is used to determine the color of the icon.
// If the 'currentPath' matches the 'to' prop (which is the path the button will navigate to when clicked),
// the color of the icon will be set to the primary text color of the theme.
// If they do not match, the color will be set to the secondary text color.
export const HeaderIconButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'currentPath',
})(({ theme, currentPath, to }) => ({
    color: to
        ? currentPath === to ||
          (currentPath === '/' && to === '/home') ||
          (currentPath === '/dalle' && to === '/agents')
            ? theme.palette.text.primary
            : theme.palette.text.secondary
        : theme.palette.text.secondary,
    fontSize: '10px',

    // The hover effect is set to change the color to the primary text color and remove any background color.
    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
    },
}));
