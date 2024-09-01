import { Box, TextField, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';

const commonStyles = {
    background: 'black',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    margin: 20,
    position: 'relative',
    padding: '10px',
    textAlign: 'center',
};

export const StyledShadowWrapper = styled('div')(({ theme }) => ({
    filter: `drop-shadow(0px 0px 10px ${theme.palette.primary.main})`,
}));

export const StyledRootNode = styled(motion.div)(({ theme }) => ({
    ...commonStyles,
    borderRadius: '0',
    width: 200,
    height: 200,
    clipPath:
        'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
}));

export const StyledQuestionNode = styled(motion.div)(({ theme }) => ({
    ...commonStyles,
    borderRadius: '10px',
    width: 250,
    height: 100,
}));

export const StyledCategoryNode = styled(motion.div)(({ theme }) => ({
    ...commonStyles,
    width: 110,
    height: 110,
    clipPath:
        'polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 17% 12%)',
}));

export const CustomTextField = styled(TextField)(({ theme }) => ({
    width: '80%',
    textAlign: 'center',
    '& .MuiInputBase-input': {
        textAlign: 'center',
    },
    '& .MuiInputBase-root': {
        border: 'none',
    },
    '& .MuiInput-underline:before': {
        borderBottom: 'none',
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
        borderBottom: 'none',
    },
    '& .MuiInput-underline:after': {
        borderBottom: 'none',
    },
}));


export const UserContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
    margin: 'auto',
    width: '100%',
    maxWidth: '800px',
    height: '50%',
    backgroundColor: theme.palette.background.paper,
}));

export const AvatarContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing(4),
}));

export const StyledAvatar = styled('img')(({ theme }) => ({
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    cursor: 'pointer',
    margin: theme.spacing(1),
    backgroundColor: 'black',
}));

export const StyledAvatarPlaceholder = styled(Box)(({ theme }) => ({
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    color: 'black',
    fontSize: '14px',
    textAlign: 'center',
    padding: theme.spacing(1),
    cursor: 'pointer',
}));

export const TextFieldContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'center',
}));

export const Username = styled(Typography)(({ theme }) => ({
    fontSize: '2rem',
    marginLeft: theme.spacing(3),
    color: theme.palette.text.primary,
}));

export const ProfileTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    margin: theme.spacing(1),
    width: '100%',
    borderRadius: '5px',
    padding: 0,
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.secondary.light,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.secondary.light,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.secondary.light,
        },
        '&.Mui-disabled fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
    '& input:-webkit-autofill': {
        WebkitBoxShadow: `0 0 0px 1000px ${theme.palette.background.paper} inset`,
        WebkitTextFillColor: theme.palette.text.primary,
        transition: 'background-color 5000s ease-in-out 0s',
    },
    '& label.Mui-focused': {
        color: theme.palette.secondary.light,
    },
    '& .MuiInputLabel-outlined': {
        color: theme.palette.secondary.light,
    },
}));

export const StyledButton = styled(Button)(({ theme }) => ({
    fontFamily: 'Titillium Web, sans-serif',
    fontWeight: 'bold',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'black',
    },
}));

StyledButton.defaultProps = {
    disableRipple: true,
    variant: 'outlined',
};
