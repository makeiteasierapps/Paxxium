import LogoutIcon from '@mui/icons-material/Logout';
import { signOut } from 'firebase/auth';
import { useContext, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, auth } from '../../auth/AuthContext';
import { HeaderContainer, HeaderIconButton } from './mainStyledComponents';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton } from '@mui/material';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Header = ({ setMobileOpen, setDrawerExpanded }) => {
    const navigate = useNavigate();
    const { setIdToken, setUser, setIsAuthorized } = useContext(AuthContext);
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIdToken(null);
            setUser(null);
            setIsAuthorized(false);
            localStorage.clear();
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

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
            <HeaderIconButton
                disableRipple
                id="logout-button"
                onClick={handleLogout}
            >
                <LogoutIcon sx={{ fontSize: '2rem' }} />
            </HeaderIconButton>
        </HeaderContainer>
    );
};

export default Header;
