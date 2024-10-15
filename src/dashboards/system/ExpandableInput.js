import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { styled } from "@mui/system";

const AnimatedContainer = styled(Box)(({ theme, expanded }) => ({
  width: expanded ? "300px" : "100px",
  transition: "width 0.3s ease-in-out",
  overflow: "hidden",
}));

const ExpandableInput = ({ expanded, onExpand, onSubmit }) => {
  const [filePath, setFilePath] = useState("");
  const handleChange = (e) => {
    setFilePath(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(filePath);
    setFilePath(""); // Clear the input after submission
  };
  return (
    <AnimatedContainer expanded={expanded}>
      {expanded ? (
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter file name"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSubmit}>
                  <SendIcon color="primary" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          autoFocus
          onChange={handleChange}
        />
      ) : (
        <Button variant="outlined" onClick={onExpand}>
          New File
        </Button>
      )}
    </AnimatedContainer>
  );
};

export default ExpandableInput;
