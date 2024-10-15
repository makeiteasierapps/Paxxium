import React, { useState, useContext, useEffect, useCallback } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import { AuthContext } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketProvider";
import { ConfigContext } from "../../contexts/ConfigContext";
import ExpandableInput from "./ExpandableInput";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const MessageBox = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  color: theme.palette.text.secondary,
  minWidth: "200px",
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
}));

const NewFileMenu = () => {
  const { socket } = useSocket();
  const { uid } = useContext(AuthContext);
  const { setSelectedFile, showSnackbar, newCategoryRef } =
    useContext(ConfigContext);
  const [expanded, setExpanded] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [progressMessage, setProgressMessage] = useState("");
  const [messageTimeout, setMessageTimeout] = useState(null);

  const checkFileExists = useCallback(
    (filename) => {
      setProgressMessage("");
      socket.emit("file_check", { filename, uid });
    },
    [socket, uid]
  );

  useEffect(() => {
    const handleUpdate = (data) => {
      if (data.message === "Creating new category...") {
        console.log("Creating new category...", data.category);
        newCategoryRef.current = data.category;
      }
      setProgressMessage(data.message);
    };

    const handleResult = (response) => {
      if (response.exists) {
        setSelectedFile({
          path: response.path,
          content: response.content,
          category: response.category,
        });
        setProgressMessage("");
      } else {
        setProgressMessage(`File "${response.path}" does not exist.`);
        setPendingFile({
          path: response.path,
          content: "",
          category: response.category,
        });
      }
      setExpanded(false);
    };

    const handleError = (error) => {
      console.error("Error checking if file exists:", error.error);
      showSnackbar("Error checking if file exists", "error");
      setProgressMessage(`Error: ${error.error}`);
    };

    socket.on("file_check_update", handleUpdate);
    socket.on("file_check_result", handleResult);
    socket.on("file_check_error", handleError);

    return () => {
      console.log("Cleaning up sockets");
      socket.off("file_check_update", handleUpdate);
      socket.off("file_check_result", handleResult);
      socket.off("file_check_error", handleError);
    };
  }, [
    socket,
    setSelectedFile,
    showSnackbar,
    newCategoryRef,
    setExpanded,
    setProgressMessage,
  ]);

  const clearProgressMessage = useCallback(() => {
    setProgressMessage("");
  }, []);

  const setTemporaryMessage = useCallback(
    (message, duration = 1500) => {
      setProgressMessage(message);
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
      const newTimeout = setTimeout(clearProgressMessage, duration);
      setMessageTimeout(newTimeout);
    },
    [clearProgressMessage, messageTimeout]
  );

  useEffect(() => {
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [messageTimeout]);

  const handleConfirmation = (confirmed) => {
    if (confirmed) {
      setSelectedFile(pendingFile);
      setTemporaryMessage(`File "${pendingFile.path}" created.`);
    } else {
      setTemporaryMessage(`File creation cancelled.`);
    }
    setPendingFile(null);
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    setProgressMessage("");
    setSelectedFile(null);
  };

  const handleSubmit = (filePath) => {
    checkFileExists(filePath);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <ExpandableInput
        expanded={expanded}
        onExpand={handleExpand}
        onSubmit={handleSubmit}
      />

      <MessageBox>
        <Typography variant="subtitle2">{progressMessage}</Typography>
        {pendingFile && (
          <>
            <Tooltip title="Create file">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleConfirmation(true)}
                sx={{ ml: 1 }}
              >
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleConfirmation(false)}
              >
                <CancelOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </MessageBox>
    </Box>
  );
};

export default NewFileMenu;
