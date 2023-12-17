import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';

// Create a styled header component that has the icons on the right grouped together
export const HeaderContainer = styled(Box)(({ theme }) => ({
    height: '6rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '1rem',
    marginBottom: '1.5rem',
    position: 'sticky',
    top: 0,
}));

// Custom IconButtons for the header, larger and using the primary color
export const HeaderIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '10px',
}));
