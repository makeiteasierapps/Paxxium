import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';

export const HeaderContainer = styled(Box)(({ theme }) => ({
    height: '6rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '1rem',
    marginBottom: '1.5rem',
    position: 'sticky',
    backgroundColor: theme.palette.background.paper,
    zIndex: 1000,
    top: 0,
}));

export const HeaderIconButton = styled(IconButton)(
    ({ theme, currentpath, to }) => ({
        color: to
            ? currentpath === to
                ? theme.palette.text.primary
                : theme.palette.text.secondary
            : theme.palette.text.secondary,
        fontSize: '10px',

        '&:hover': {
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
        },
    })
);
