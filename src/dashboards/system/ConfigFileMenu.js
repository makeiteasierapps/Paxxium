import React, { useState, useContext } from 'react';
import { SystemContext } from '../../contexts/SystemContext';
import { Button, Box, Typography, Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    ScrollContainer,
    ScrollContent,
} from '../insight/styledInsightComponents';
import NewFileMenu from './NewFileMenu';
import { styled } from '@mui/system';

const ConfigFileMenu = () => {
    const { selectedFile, setSelectedFile, categories, filesByCategory } =
        useContext(SystemContext);
    const [activeCategory, setActiveCategory] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event, category) => {
        setAnchorEl(event.currentTarget);
        setActiveCategory(category);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        handleMenuClose();
    };

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
            id="config-file-menu"
        >
            <NewFileMenu />
            <ScrollContainer>
                <ScrollContent alignItems="center">
                    {categories.map((category) => (
                        <React.Fragment key={category}>
                            <Button
                                variant={
                                    activeCategory === category
                                        ? 'contained'
                                        : 'outlined'
                                }
                                onClick={(e) => handleMenuClick(e, category)}
                                sx={{
                                    mx: 1,
                                    minWidth: 'max-content',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    backgroundColor:
                                        activeCategory === category
                                            ? 'primary.main'
                                            : 'transparent',
                                    color:
                                        activeCategory === category
                                            ? 'primary.contrastText'
                                            : 'primary.main',
                                    '&:hover': {
                                        backgroundColor:
                                            activeCategory === category
                                                ? 'primary.dark'
                                                : 'primary.light',
                                    },
                                }}
                            >
                                {category}
                            </Button>
                            <Menu
                                anchorEl={
                                    activeCategory === category
                                        ? anchorEl
                                        : null
                                }
                                open={activeCategory === category && open}
                                onClose={handleMenuClose}
                            >
                                {filesByCategory[category]?.map((file) => (
                                    <MenuItem
                                        key={file.path}
                                        onClick={() => handleFileSelect(file)}
                                        selected={
                                            file.path === selectedFile?.path
                                        }
                                    >
                                        <Typography variant="inherit" noWrap>
                                            {file.path.split('/').pop()}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: '0.75rem',
                                                ml: 1,
                                                opacity: 0.7,
                                            }}
                                        >
                                            {file.path}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </React.Fragment>
                    ))}
                </ScrollContent>
            </ScrollContainer>
        </Box>
    );
};

export default ConfigFileMenu;
