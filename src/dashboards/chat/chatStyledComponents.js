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

export const ChatContainerStyled = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '80%',
    minHeight: '95vh',
    maxHeight: '95vh',
    borderRadius: '7px',
    [theme.breakpoints.down('sm')]: {
        minWidth: '100vw',
        maxWidth: '100vw',
        minHeight: '95vh',
        maxHeight: '95vh',
        borderRadius: '0px',
    },
}));

export const MessageArea = styled(List)({
    flexGrow: 1,
    overflowY: 'auto',
    width: '100%',
    padding: '0px',
});

export const MessagesContainer = styled(Box)({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    whiteSpace: 'pre-line',
});

// Used for Chat, and User
export const MessageContainer = styled(ListItem, {
    shouldForwardProp: (prop) => prop !== 'messageFrom',
})(({ theme, messageFrom }) => ({
    backgroundColor:
        messageFrom === 'user'
            ? theme.palette.background.user
            : theme.palette.background.agent,
    wordBreak: 'break-word',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'flex-start',
    paddingRight: '50px',
    paddingTop: '20px',
    paddingBottom: '20px',
}));

export const MessageContent = styled(({ imageUrl, ...other }) => (
    <Box {...other} />
))(({ theme, imageUrl }) => ({
    maxHeight: '100%',
    overflowX: 'hidden',
    width: '100%',
    whiteSpace: 'pre-wrap',
    alignSelf: imageUrl ? 'center' : 'flex-start',
    marginLeft: imageUrl ? '10px' : '0px',
}));

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
    alignItems: 'center',
    paddingTop: '10px',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
        paddingBottom: '20px',
    },
}));

// MessageInput
export const StyledInputTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: 'none',
        },
        '&:hover fieldset': {
            border: 'none',
        },
        '&.Mui-focused fieldset': {
            border: 'none',
        },
    },
}));

const RefWrapper = forwardRef(({ isDragActive, ...other }, ref) => (
    <Box ref={ref} {...other} />
));

export const StyledBox = styled(RefWrapper)(({ theme, isDragActive }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    border: isDragActive
        ? '2px solid green'
        : `2px solid ${theme.palette.secondary.light}`,
    borderRadius: theme.shape.borderRadius,
}));

export const StyledInputLabel = styled(
    ({ hasImage, isFocused, userMessage, ...other }) => (
        <InputLabel {...other} />
    )
)(({ theme, hasImage, isFocused, userMessage }) => ({
    position: 'absolute',
    top: '50%',
    left: hasImage ? '120px' : '12px',
    visibility: isFocused || userMessage ? 'hidden' : 'visible',
    transform: 'translateY(-50%)',
    backgroundColor: theme.palette.background.paper,
    paddingLeft: '5px',
    paddingRight: '5px',
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
