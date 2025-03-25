import { styled } from '@mui/system';

import {
    Box,
    List,
    ListItem,
    Button,
    IconButton,
    TextField,
} from '@mui/material';
import Markdown from 'react-markdown';

// AgentDash.js
export const SettingsSubmitButton = styled(Button)(({ theme }) => ({
    backgroundColor: 'transparent',
    fontFamily: theme.typography.applyFontFamily('primary').fontFamily,
    fontWeight: 'bold',
    fontSize: '1rem',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'black',
    },
}));

SettingsSubmitButton.defaultProps = {
    disableRipple: true,
    variant: 'outlined',
};

export const StyledMarkdown = styled(Markdown)(({ theme }) => ({
    '& h1, & h2, & h3, & h4, & h5, & h6': {
        margin: '1em 0 0.5em 0', // Add spacing around headers
    },
    '& p': {
        margin: '0.75em 0', // Add spacing around paragraphs
        lineHeight: '1.6',
    },
    '& ul, & ol': {
        margin: '0',
        paddingLeft: '.6em',
        listStylePosition: 'outside',
    },
    '& li': {
        marginBottom: '0.5em',
        lineHeight: '1.6',
        display: 'list-item', // Ensures proper list rendering
        '& p': {
            display: 'inline', // Makes paragraph content inline with the number
            margin: 0, // Removes paragraph margins within list items
        },
    },
    '& pre': {
        margin: '0',
    },
    '& table': {
        borderCollapse: 'collapse',
        margin: '15px 0',
        width: '100%',
    },
    '& th, & td': {
        border: '1px solid #ddd',
        padding: '12px',
    },
    '& th': {
        fontWeight: 'bold',
    },
    '& li:last-child': {
        marginBottom: 0, // Remove margin from last item
    },
}));

export const SettingsMenuButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'error',
})(({ theme, error }) => ({
    fontFamily: theme.typography.applyFontFamily('primary').fontFamily,
    fontWeight: 'bold',
    fontSize: '1rem',
    width: '33%',
    height: '40px',
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    border: error ? `1px solid ${theme.palette.error.main}` : undefined,
    color: error ? theme.palette.error.main : undefined,
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'black',
    },
}));

SettingsMenuButton.defaultProps = {
    disableRipple: true,
    variant: 'outlined',
};

export const InvisibleInput = styled(TextField)({
    '& .MuiInputBase-input': {
        width: '100%',
        height: '40px',
        fontSize: 'inherit',
        padding: 0,
        color: 'black',
    },
    '& .MuiInput-underline:before, & .MuiInput-underline:after': {
        display: 'none',
    },
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
            border: 'none',
        },
    },
});

export const ChatContainerStyled = styled(Box, {
    shouldForwardProp: (prop) => !['isDragActive', 'sx'].includes(prop),
})(({ theme, isDragActive, sx }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1000px',
    height: '95vh',
    borderRadius: '10px',
    overflow: 'hidden',
    whiteSpace: 'pre-line',
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
        pointerEvents: 'none',
        opacity: isDragActive ? 1 : 0,
        transition: 'opacity 0.2s ease',
        zIndex: 1,
    },

    ...(sx || {}),
}));

export const MessageArea = styled(List)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    width: '100%',
    padding: theme.spacing(1),
    scrollBehavior: 'smooth',
    marginTop: theme.spacing(1),
}));

export const MessageListItem = styled(ListItem, {
    shouldForwardProp: (prop) => prop !== 'messageFrom',
})(({ theme, messageFrom }) => ({
    backgroundColor:
        messageFrom === 'user' ? theme.palette.background.user : 'transparent',
    maxWidth: messageFrom === 'user' ? '60%' : '100%', // Keep maxWidth for user messages
    width: messageFrom === 'user' ? 'fit-content' : '100%', // Apply fit-content only for user
    height: 'auto',
    wordBreak: 'break-word',
    margin: messageFrom === 'user' ? '0 0 0 auto' : '0 auto 0 0',
    borderRadius: theme.shape.borderRadius,
    boxShadow: messageFrom === 'user' ? theme.shadows[3] : 'none',
    display: 'block',
    [theme.breakpoints.down('sm')]: {
        maxWidth: '95%', // Adjust maxWidth for smaller screens
        padding: theme.spacing(1),
    },
}));

export const StyledUserAvatar = styled('div')(({ theme }) => ({
    float: 'left',
    marginRight: theme.spacing(1.5),
    lineHeight: 1,
    shapeOutside: 'margin-box',
    position: 'relative',
    top: theme.spacing(-0.5),
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle, 
        transparent 0%, 
        transparent 35%, 
        ${theme.palette.background.user} 75%, 
        ${theme.palette.background.user} 100%)`,
        pointerEvents: 'none',
    },
    '& .MuiAvatar-root': {
        width: 30,
        height: 30,
        backgroundColor: 'transparent',
        objectFit: 'contain',
    },

    [theme.breakpoints.down('sm')]: {
        '& .MuiAvatar-root': {
            width: 22,
            height: 22,
        },
        top: theme.spacing(0),
    },
}));

// Chatbar
export const Bar = styled(Box, {
    shouldForwardProp: (prop) => !['sx'].includes(prop),
})(({ theme, sx }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    flexDirection: 'row',
    zIndex: 100,
    padding: theme.spacing(1, 2),
    ...(sx || {}),
}));

export const ClearAndTrashIcons = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '9px',
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
    padding: 0,
    color: theme.palette.text.primary,
    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.text.secondary,
    },
}));

export const CloseIconButton = styled(IconButton)(({ theme }) => ({
    transform: 'translate(-60%, -90%)',
    padding: 1,
    boxShadow: '0px 2px 10px 0px rgba(0,0,0,0.43)',
    color: theme.palette.text.primary,
    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.text.secondary,
    },
}));

export const InputArea = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '10px',
    width: '80%',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
        paddingBottom: '20px',
        width: '95%',
    },
}));

export const StyledInputTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: `2px solid ${theme.palette.secondary.light}`,
            borderRadius: '15px',
        },
        '&:hover fieldset': {
            borderColor: theme.palette.secondary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.secondary.main,
        },
    },
}));
