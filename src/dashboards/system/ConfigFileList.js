import React, { useState, useContext } from 'react';
import { SystemContext } from '../../contexts/SystemContext';
import {
    Button,
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemText,
} from '@mui/material';

import { styled } from '@mui/system';

const AnimatedBox = styled(Box)(({ theme }) => ({
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.standard,
    }),
    transform: 'translateX(-100%)',
    '&.visible': {
        transform: 'translateX(0)',
    },
}));

const ConfigFileList = () => {
    const { selectedFile, setSelectedFile, categories, filesByCategory } =
        useContext(SystemContext);
    const [selectedCategory, setSelectedCategory] = useState(null);

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    mb: 2,
                    pb: 1,
                    width: '100%',
                    overflowX: 'auto',
                    display: 'flex',
                    '&::-webkit-scrollbar': {
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'primary.light',
                        borderRadius: '3px',
                    },
                }}
            >
                {categories.map((category) => (
                    <Button
                        key={category}
                        variant={
                            selectedCategory === category
                                ? 'contained'
                                : 'outlined'
                        }
                        onClick={() => setSelectedCategory(category)}
                        sx={{
                            mx: 1,
                            minWidth: 'max-content',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            backgroundColor:
                                selectedCategory === category
                                    ? 'primary.main'
                                    : 'transparent',
                            color:
                                selectedCategory === category
                                    ? 'primary.contrastText'
                                    : 'primary.main',
                            '&:hover': {
                                backgroundColor:
                                    selectedCategory === category
                                        ? 'primary.dark'
                                        : 'primary.light',
                            },
                        }}
                    >
                        {category}
                    </Button>
                ))}
            </Box>

            <AnimatedBox
                className={selectedCategory ? 'visible' : ''}
                sx={{ width: '100%' }}
            >
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
