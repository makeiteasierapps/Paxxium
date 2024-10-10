import React, { useState } from "react";
import { useConfig } from "../../hooks/useConfigManager";
import {
  Button,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/system";

const AnimatedBox = styled(Box)(({ theme }) => ({
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.standard,
  }),
  transform: "translateX(-100%)",
  "&.visible": {
    transform: "translateX(0)",
  },
}));

const ConfigFileList = () => {
  const { configFiles, selectedFile, setSelectedFile } = useConfig();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Group files by category
  const categories = [...new Set(configFiles.map((file) => file.category))];
  const filesByCategory = configFiles.reduce((acc, file) => {
    if (!acc[file.category]) acc[file.category] = [];
    acc[file.category].push(file);
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "contained" : "outlined"}
            onClick={() => setSelectedCategory(category)}
            sx={{
              mx: 1,
              backgroundColor:
                selectedCategory === category ? "primary.main" : "transparent",
              color:
                selectedCategory === category
                  ? "primary.contrastText"
                  : "primary.main",
              "&:hover": {
                backgroundColor:
                  selectedCategory === category
                    ? "primary.dark"
                    : "primary.light",
              },
            }}
          >
            {category}
          </Button>
        ))}
      </Box>

      <AnimatedBox className={selectedCategory ? "visible" : ""}>
        {selectedCategory && (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {selectedCategory}
            </Typography>
            <List>
              {filesByCategory[selectedCategory].map((file) => (
                <ListItemButton
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  selected={file.path === selectedFile?.path}
                >
                  <ListItemText primary={file.path} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </AnimatedBox>
    </Box>
  );
};

export default ConfigFileList;
