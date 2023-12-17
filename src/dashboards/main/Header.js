import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import AgentsIcon from '@mui/icons-material/People';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import { Typography } from '@mui/material';
import { signOut } from 'firebase/auth';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, auth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';
import HeaderContainer from './Header';

const Header = () => {
    const navigate = useNavigate();
    const { setIdToken, setUser, username, setIsAuthorized } =
        useContext(AuthContext);

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
            <IconButton color="inherit" component={Link} to="/home">
                <HomeIcon />
            </IconButton>
            <IconButton color="inherit" component={Link} to="/agents">
                <AgentsIcon />
            </IconButton>
            <IconButton color="inherit" component={Link} to="/profile">
                <ProfileIcon />
            </IconButton>
            <Typography
                id="welcome-message"
                variant="h5"
                noWrap
                fontFamily={'Montserrat'}
                component="div"
                flexGrow={1}
                align="center"
            >
                Welcome {username}
            </Typography>
            <IconButton id="logout-button" onClick={handleLogout}>
                <LogoutIcon sx={{ color: '#fff' }} />
            </IconButton>
        </HeaderContainer>
    );
};

export default Header;
