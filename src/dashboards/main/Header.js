import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import AgentsIcon from '@mui/icons-material/People';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import { signOut } from 'firebase/auth';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, auth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';
import { HeaderContainer, HeaderIconButton } from './mainStyledComponents';
import { useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';
const Header = () => {
    const navigate = useNavigate();
    const { setIdToken, setUser, setIsAuthorized } = useContext(AuthContext);

    const location = useLocation();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIdToken(null);
            setUser(null);
            setIsAuthorized(false);
            localStorage.setItem('isAuthorized', 'false');
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <HeaderContainer id="header">
            <Typography
                component="div"
                sx={{
                    flexGrow: 1,
                    textAlign: 'left',
                    fontFamily: 'Trillium Web',
                    fontWeight: 'bold',
                    fontSize: '2rem',
                    marginLeft: '2rem',
                }}
            >
                Paxxium
            </Typography>
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/home"
                currentpath={location.pathname}
            >
                <HomeIcon sx={{ fontSize: '2rem' }} />
            </HeaderIconButton>
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/agents"
                currentpath={location.pathname}
            >
                <AgentsIcon sx={{ fontSize: '2rem' }} />
            </HeaderIconButton>
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/profile"
                currentpath={location.pathname}
            >
                <ProfileIcon sx={{ fontSize: '2rem' }} />
            </HeaderIconButton>

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
