import { useContext, useState } from 'react';
import styled from '@mui/system/styled';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { AuthContext, auth } from '../../contexts/AuthContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import paxxiumTextLogo from '../../assets/images/paxxium-logo-text-only.png';
import { StyledTextField } from '../authStyledComponents';
import MySnackBar from '../../SnackBar';

export const StyledButton = styled(Button)(({ theme }) => ({
    fontFamily: 'Titillium Web, sans-serif',
    fontWeight: 'bold',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'black',
    },
}));

StyledButton.defaultProps = {
    disableRipple: true,
    variant: 'outlined',
};

const Login = ({ setIsLogin }) => {
    const { setUser, setUid } = useContext(AuthContext);
    const { showSnackbar, hideSnackbar, snackbarInfo } =
        useContext(SnackbarContext);

    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const data = new FormData(event.currentTarget);
        try {
            const email = data.get('email');
            const password = data.get('password');
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;
            setUser(user);
            setUid(user.uid);
            setIsLoading(false);
        } catch (error) {
            let errorMessage = 'Login failed with token';
            if (error.response && error.response.data) {
                errorMessage = error.response.data;
            } else if (error.message) {
                errorMessage = error.message;
            }
            showSnackbar(errorMessage, 'error');
            setIsLoading(false);
        }
    };

    return (
        <>
            <Box
                component="img"
                src={paxxiumTextLogo}
                alt="Paxxium Logo"
                sx={{
                    height: 'auto',
                    width: '90%',
                    maxWidth: '300px',
                    maxHeight: '100px',
                    marginBottom: '40px',
                }}
            />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '80%',
                    maxWidth: '500px',
                }}
                component="form"
                onSubmit={handleLogin}
                noValidate
            >
                <StyledTextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                />
                <StyledTextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                />
                <StyledButton
                    type="submit"
                    disabled={isLoading}
                    fullWidth
                    sx={{ mt: 3, mb: 2 }}
                >
                    Sign In
                </StyledButton>
                <Link
                    onClick={() => setIsLogin(false)}
                    variant="body2"
                    sx={{ cursor: 'pointer' }}
                >
                    {"Don't have an account? Sign Up"}
                </Link>
                <MySnackBar
                    open={snackbarInfo.open}
                    message={snackbarInfo.message}
                    severity={snackbarInfo.severity}
                    handleClose={hideSnackbar}
                />
            </Box>
        </>
    );
};

export default Login;
