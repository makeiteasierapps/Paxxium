import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// Creating a styled component for my Header component
export const HeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    backgroundColor: '#455a64',
    position: 'sticky',
    top: 0,
}));

