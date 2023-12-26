import { useContext } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { AuthContext } from './AuthContext';
import paxxiumTextLogo from '../assets/images/paxxium-logo-text-only.png';
import { StyledTextField } from '../auth/authStyledComponents';

export default function LoginPage() {
    const auth = getAuth();
    const { setUser } = useContext(AuthContext);

    const handleLogin = async (event) => {
        event.preventDefault();
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
        } catch (error) {
            console.error(
                'There has been a problem with your login operation:',
                error
            );
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100%',
            }}
        >
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
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    Sign In
                </Button>
                <Link href="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
                </Link>
            </Box>
        </Box>
    );
}
