import { styled } from '@mui/system';
import { Box, List, ListItem, Button, IconButton } from '@mui/material';
import { blueGrey } from '@mui/material/colors';

// AgentDash.js
export const Container = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
}));

export const SettingsMenuButton = styled(Button)(({ theme }) => ({
    color: theme.palette.text.secondary,
    backgroundColor: 'transparent',
    padding: 0,
    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
    },
}));

export const SettingsMenuContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
}));

export const Settings = styled(Box)(({ theme }) => ({
    width: '100%',
    maxWidth: 600,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.63)',
}));

// Used for both Debate and Chat
export const ChatContainerStyled = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(1),
    minWidth: '100%',
    maxWidth: '80vw',
    minHeight: '40vh',
    maxHeight: '75vh',
    overflow: 'auto',
    borderRadius: '5px',
    boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.63)',
    // xs & sm screens: resize to take up most of the screen
    [theme.breakpoints.down('sm')]: {
        minWidth: '100vw',
        maxWidth: '100vw',
        minHeight: '75vh',
        maxHeight: '75vh',
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

// Used for Chat, Debate, and User
export const MessageContainer = styled(ListItem)({
    backgroundColor: blueGrey[700],
    wordBreak: 'break-word',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'flex-start',
    paddingRight: '50px',
    paddingTop: '20px',
    paddingBottom: '20px',
});

export const MessageContent = styled(({ imageUrl, ...other }) => (
    <Box {...other} />
))(({ theme, imageUrl }) => ({
    maxHeight: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    whiteSpace: 'pre-wrap',
    alignSelf: imageUrl ? 'center' : 'flex-start',
    marginLeft: imageUrl ? '10px' : '0px',
}));

// Chatbar
export const Bar = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderBottom: '1px solid #e0e0e0',
}));

export const ChatBarIcons = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
    padding: 0,
    color: theme.palette.text.secondary,
    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
    },
}));

export const CloseIconButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    transform: 'translate(-100%, -140%)',
    padding: 0,
    color: theme.palette.text.secondary,
    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
    },
}));

export const InputArea = styled(Box)({
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
});
