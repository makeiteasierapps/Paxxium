import { styled } from '@mui/system';
import { Card, CardMedia, IconButton, TextField, Box } from '@mui/material';

export const StyledCard = styled(Card)(({ theme }) => ({
    width: '50vw',
    maxWidth: '500px',
    height: '40vh',
    overflowY: 'scroll',
    boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)',
}));

export const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    height: 140,
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    opacity: 0.3,
    '&:hover': { opacity: 1 },
}));

export const SearchField = styled(TextField)(({ theme }) => ({
    display: 'flex',
}));

export const SearchContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
}));

export const CarouselContainer = styled(Box)(({ theme }) => ({
    width: '50vw',
    height: '40vh',
    [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
        width: '100vw', // take up 100% of screen width on small screens
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
}));
