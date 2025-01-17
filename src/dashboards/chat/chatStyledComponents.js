import { styled } from '@mui/system';
import { forwardRef } from 'react';

import {
    Box,
    List,
    ListItem,
    Button,
    IconButton,
    TextField,
    InputLabel,
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
    '& h1, & h2, & h3, & h4, & h5, & h6, & p': {
        margin: '0',
        padding: '0',
        display: 'inline',
        lineHeight: '1.2',
    },
    '& ul, & ol': {
        margin: '0',
        paddingLeft: '.6em',
        lineHeight: '0.6',
        listStylePosition: 'inside',
    },
    '& li': {
        lineHeight: '1.4',
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
        textAlign: 'left',
    },
    '& th': {
        fontWeight: 'bold',
    },
    '& td:first-of-type': {
        width: '1%',
        wordBreak: 'keep-all',
        textAlign: 'center',
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

export const SettingsMenuContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '100%',
}));

// Container components
export const ChatContainerStyled = styled(Box)(({ theme, sx }) => ({
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
    ...(sx || {}),
}));

export const MessageArea = styled(List)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    width: '100%',
    padding: theme.spacing(1),
    scrollBehavior: 'smooth',
}));

export const MessageListItem = styled(ListItem, {
    shouldForwardProp: (prop) => prop !== 'messageFrom',
})(({ theme, messageFrom }) => ({
    backgroundColor: theme.palette.background[messageFrom],
    width: messageFrom === 'user' ? '60%' : '80%',
    height: 'auto',
    wordBreak: 'break-word',
    alignItems: 'flex-start',
    padding: theme.spacing(1),
    margin: `${theme.spacing(2)} auto`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

export const MessageContent = styled(Box)({
    overflow: 'auto',
    borderRadius: 'inherit',
});

// Chatbar
export const Bar = styled(Box)(({ theme }) => ({
    position: 'relative',
    backgroundColor: theme.palette.secondary.dar,
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
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
    },
}));

// MessageInput
export const StyledInputTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: `2px solid ${theme.palette.secondary.light}`,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.secondary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.secondary.main,
        },
    },
}));

export const ImageOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: theme.palette.common.white,
    cursor: 'pointer',
    visibility: 'hidden',
    '&:hover': {
        visibility: 'visible',
    },
}));
