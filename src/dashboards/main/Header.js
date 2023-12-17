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

const Header = () => {
    const navigate = useNavigate();
    const { setIdToken, setUser, setIsAuthorized } = useContext(AuthContext);

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
            <HeaderIconButton color="inherit" component={Link} to="/home">
                <HomeIcon sx={{ fontSize: '2rem' }} />
            </HeaderIconButton>
            <HeaderIconButton color="inherit" component={Link} to="/agents">
                <AgentsIcon sx={{ fontSize: '2rem' }} />
            </HeaderIconButton>
            <HeaderIconButton color="inherit" component={Link} to="/profile">
                <ProfileIcon sx={{ fontSize: '2rem' }} />
            </HeaderIconButton>

            <HeaderIconButton id="logout-button" onClick={handleLogout}>
                <LogoutIcon sx={{ fontSize: '2rem' }} />
            </HeaderIconButton>
        </HeaderContainer>
    );
};

export default Header;
