import { TextField, Container, Typography } from '@mui/material';
import { styled } from '@mui/system';

export const StyledTextField = styled(TextField)(({ theme }) => ({
    '& input:-webkit-autofill': {
        WebkitBoxShadow: `0 0 0px 1000px ${theme.palette.background.paper} inset`,
        WebkitTextFillColor: theme.palette.text.primary,
        transition: 'background-color 5000s ease-in-out 0s',
    },
}));

export const StyledContainer = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
}));

export const WelcomeMessageText = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(2),
    fontSize: '1.11rem',
    textAlign: 'center',
}));
