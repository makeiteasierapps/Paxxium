import { styled } from "@mui/system";
import { Box, List, ListItem, Button, IconButton } from "@mui/material";

// AgentDash.js
export const SettingsMenuButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  backgroundColor: "transparent",
  padding: 0,
  "&:hover": {
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
  },
}));

export const SettingsMenuContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}));

export const Settings = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 600,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.63)",
}));

// Used for both Debate and Chat
export const ChatContainerStyled = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  marginBottom: theme.spacing(1),
  width: "80%",
  minHeight: "80%",
  height: "87%",
  borderRadius: "5px",
  boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.63)",
  // xs & sm screens: resize to take up most of the screen
  [theme.breakpoints.down("sm")]: {
    minWidth: "100vw",
    maxWidth: "100vw",
    minHeight: "75vh",
    maxHeight: "75vh",
  },
}));

export const MessageArea = styled(List)({
  flexGrow: 1,
  overflowY: "auto",
  width: "100%",
  padding: "0px",
});

export const MessagesContainer = styled(Box)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  whiteSpace: "pre-line",
});

// Used for Chat, Debate, and User
export const MessageContainer = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "messageFrom",
})(({ theme, messageFrom }) => ({
  backgroundColor:
    messageFrom === "user"
      ? theme.palette.secondary.main
      : theme.palette.secondary.dark,
  wordBreak: "break-word",
  flexDirection: "row",
  display: "flex",
  alignItems: "flex-start",
  paddingRight: "50px",
  paddingTop: "20px",
  paddingBottom: "20px",
}));

export const MessageContent = styled(({ imageUrl, ...other }) => (
  <Box {...other} />
))(({ theme, imageUrl }) => ({
  maxHeight: "100%",
  overflowX: "hidden",
  width: "100%",
  whiteSpace: "pre-wrap",
  alignSelf: imageUrl ? "center" : "flex-start",
  marginLeft: imageUrl ? "10px" : "0px",
}));

// Chatbar
export const Bar = styled(Box)(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.secondary.dar,
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2),
  borderBottom: `2px solid ${theme.palette.secondary.main}`,
}));

export const ClearAndTrashIcons = styled(Box)(({ theme }) => ({
  transform: "translate(30%, -70%)",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: 0,
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
  },
}));

export const CloseIconButton = styled(IconButton)(({ theme }) => ({
  transform: "translate(-70%, -110%)",
  padding: 1,
  boxShadow: "0px 2px 10px 0px rgba(0,0,0,0.43)",
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
  },
}));

export const InputArea = styled(Box)({
  padding: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});
