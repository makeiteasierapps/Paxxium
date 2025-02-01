import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
export const ScrollContainer = styled(Box, {
    shouldForwardProp: (prop) => !['sx'].includes(prop),
})(({ theme, sx }) => ({
    display: 'flex',
    position: 'relative',
    width: '100%',
    margin: '0',

    '&::after, &::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        height: '100%',
        pointerEvents: 'none',
        [theme.breakpoints.down('sm')]: {
            width: '40px', // Smaller gradient width on mobile
        },
    },
    '&::after': {
        right: 0,
        background: `linear-gradient(to left, 
            ${theme.palette.background.default} 30%, 
            ${theme.palette.background.default}00)`,
    },
    '&::before': {
        left: 0,
        background: `linear-gradient(to right, 
            ${theme.palette.background.default} 30%, 
            ${theme.palette.background.default}00)`,
        zIndex: 1,
    },
}));

export const ScrollContent = styled(Box, {
    shouldForwardProp: (prop) => !['sx'].includes(prop),
})(({ theme, sx }) => ({
    display: 'flex',
    width: '100%',
    gap: '1.5rem',
    overflowX: 'auto',
    padding: '0.8rem 40px',
    scrollBehavior: 'smooth',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
        display: 'none',
    },
    ...(sx || {}),
}));

export const CategoryText = styled(Typography)(({ theme }) => ({
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 1,
    wordWrap: 'break-word',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

export const CategoryButtonContainer = styled(Box)(({ theme, selected }) => ({
    width: 230,
    height: 80,
    background: selected
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(8px)',
    borderRadius: '20px',
    border: `1px solid ${
        selected ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.08)'
    }`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
}));

export const StyledProgressIndicator = styled(Box)(({ theme }) => ({
    display: 'flex',
    position: 'relative',
    width: '80%',
    height: '16px',
    margin: '0 auto',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
}));

export const ProgressBar = styled(Box)(({ width }) => ({
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: width,
    background:
        'linear-gradient(90deg, rgba(0, 153, 255, 0.3) 0%, rgba(0, 153, 255, 0.6) 100%)',
    transition: 'width 0.3s ease-in-out',
}));

export const ProgressText = styled(Typography)({
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
});
