import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { MainContext } from '../../contexts/MainContext';
const MainContent = ({ children, drawerWidth, expandedDrawerWidth }) => {
    const { isDrawerExpanded } = useContext(MainContext);

    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                p: 1,
                ml: {
                    sm: isDrawerExpanded
                        ? `${expandedDrawerWidth}px`
                        : `${drawerWidth}px`,
                },
            }}
        >
            {children}
        </Box>
    );
};

export default MainContent;
