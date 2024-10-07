import { useLayoutEffect, useContext } from 'react';
import { HeaderContainer } from './mainStyledComponents';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { MainContext } from '../../contexts/MainContext';
const Header = ({ setMobileOpen }) => {
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
                sx={{ marginLeft: '1px', display: { sm: 'none' } }}
            >
                <MenuIcon />
            </IconButton>
        </HeaderContainer>
    );
};

export default Header;
