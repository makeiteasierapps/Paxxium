import { useLayoutEffect } from 'react';
import { HeaderContainer } from './mainStyledComponents';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Header = ({ setMobileOpen, setDrawerExpanded }) => {
    const theme = useTheme();
    const permanentDrawerOpen = useMediaQuery(theme.breakpoints.up('sm'));

    useLayoutEffect(() => {
        if (permanentDrawerOpen) {
            setDrawerExpanded(false);
            setMobileOpen(false);
        }
    }, [permanentDrawerOpen, setDrawerExpanded, setMobileOpen]);

    return (
        <HeaderContainer permanentDrawerOpen={permanentDrawerOpen} id="header">
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => {
                    setMobileOpen(true);
                    setDrawerExpanded(true);
                }}
                sx={{ marginLeft: '1px', display: { sm: 'none' } }}
            >
                <MenuIcon />
            </IconButton>
        </HeaderContainer>
    );
};

export default Header;
