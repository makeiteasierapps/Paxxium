import { Box, styled } from '@mui/material';

export const MainContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start', // Change from 'center' to 'flex-start'
    width: '100%',
    minHeight: '90vh',
    overflow: 'auto',
    padding: theme.spacing(2), 
}));

export const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '7px',
    boxShadow: `0px 0px 6px 2px ${theme.palette.primary.main}`,
}));