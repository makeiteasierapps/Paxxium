import { useLayoutEffect, useContext } from 'react';
import { HeaderContainer } from './mainStyledComponents';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Box, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { MainContext } from '../../contexts/MainContext';
const Header = ({ setMobileOpen, title, tools }) => {
    const theme = useTheme();
    const permanentDrawerOpen = useMediaQuery(theme.breakpoints.up('sm'));
    const { setIsDrawerExpanded } = useContext(MainContext);
    useLayoutEffect(() => {
        if (permanentDrawerOpen) {
            setIsDrawerExpanded(false);
            setMobileOpen(false);
        }
    }, [permanentDrawerOpen, setIsDrawerExpanded, setMobileOpen]);

    return (
        <HeaderContainer permanentDrawerOpen={permanentDrawerOpen} id="header">
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => {
                    setMobileOpen(true);
                    setIsDrawerExpanded(true);
                }}
                sx={{
                    display: { sm: 'none' },
                    marginRight: 1,
                    alignSelf: 'center',
                }}
            >
                <MenuIcon />
            </IconButton>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    px: 2,
                }}
            >
                <Typography variant="h4">{title}</Typography>
                {tools && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        {tools}
                    </Box>
                )}
            </Box>
        </HeaderContainer>
    );
};

export default Header;
