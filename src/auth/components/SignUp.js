import { useState } from 'react';
import styled from '@mui/system/styled';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { StyledTextField, WelcomeMessageText } from '../authStyledComponents';

const SignUp = ({ setIsLogin }) => {
    const [formValid, setFormValid] = useState({
        username: true,
        email: true,
        password: true,
        openAiApiKey: true,
    });
    const [serverError, setServerError] = useState('');
    const [formValues, setFormValues] = useState({
        username: '',
        email: '',
        password: '',
        openAiApiKey: '',
    });
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const StyledButton = styled(Button)(({ theme }) => ({
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

    const isValid = {
        // username must be between 5 and 10 characters long and can only contain alphanumeric characters and underscores
        username: (username) => /^\w{5,10}$/.test(username),
        // Email must be a valid email address
        email: (email) =>
            /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email),
        // Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number
        password: (password) =>
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password),
        // Must not be empty
        openAiApiKey: (key) => key && key.trim().length > 0,
    };

    const errorMessages = {
        username:
            'Username should be between 5 and 10 characters, and can contain alphanumeric characters and underscores.',
        email: 'Invalid email address.',
        password:
            'Password should be 8 or more characters, and must contain at least one uppercase, one lowercase letter and a digit.',
    };

    const handleInputChange = (event) => {
        const fieldName = event.target.name;
        const value = event.target.value;
        setFormValues({ ...formValues, [fieldName]: value });
        setFormValid({ ...formValid, [fieldName]: isValid[fieldName](value) });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Validate all fields and update formValid state
        const newFormValid = {
            username: isValid.username(formValues.username),
            email: isValid.email(formValues.email),
            password: isValid.password(formValues.password),
            openAiApiKey: isValid.openAiApiKey(formValues.openAiApiKey),
        };
        setFormValid(newFormValid);
        if (Object.values(formValid).every((field) => field)) {
            try {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    formValues.email,
                    formValues.password
                );
                const user = userCredential.user;
                const uid = user.uid;

                if (!user) {
                    throw new Error('User not created');
                }

                const response = await fetch(`${backendUrl}/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                    body: JSON.stringify({
                        uid: uid,
                        username: formValues.username,
                        openAiApiKey: formValues.openAiApiKey,
                        authorized: false,
                    }),
                });

                // If the request was not successful, throw an error
                if (!response.ok) {
                    throw new Error('Error when saving user data');
                }

                setOpen(true);
            } catch (error) {
                console.error(error);
                setServerError(error.message);
            }
        }
    };

    return (
        <>
            <Typography variant="h2" fontFamily="Trillium Web">
                Paxxium
            </Typography>
            <WelcomeMessageText
                sx={{ mt: 2 }}
                variant="body2"
                color="text.secondary"
            >
                In order to use the app a couple of api keys are needed. OpenAI
                is a paid api but it is very reasonable, and SerpAPI is has a
                generous free tier. I take security serious, keys are encrypted
                using Google's Key Management Service (KMS), stored and used
                only on the server side.
                <br />
                <br />
                Once your account has been approved you will be notified.
            </WelcomeMessageText>
            <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ mt: 3 }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <StyledTextField
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            value={formValues.username}
                            error={!formValid.username}
                            helperText={
                                !formValid.username
                                    ? errorMessages.username
                                    : ''
                            }
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            value={formValues.email}
                            error={!formValid.email}
                            helperText={
                                !formValid.email ? errorMessages.email : ''
                            }
                            autoComplete="email"
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            required
                            fullWidth
                            id="openAiApiKey"
                            label="OpenAI API Key"
                            name="openAiApiKey"
                            value={formValues.openAiApiKey}
                            error={!formValid.openAiApiKey}
                            helperText={
                                !formValid.openAiApiKey
                                    ? errorMessages.openAiApiKey
                                    : ''
                            }
                            type="password"
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            value={formValues.password}
                            error={!formValid.password}
                            helperText={
                                !formValid.password
                                    ? errorMessages.password
                                    : ''
                            }
                            autoComplete="new-password"
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
                <StyledButton type="submit" fullWidth sx={{ mt: 3, mb: 2 }}>
                    Sign Up
                </StyledButton>
                <Grid container justifyContent="center">
                    <Grid item>
                        <Link
                            onClick={() => setIsLogin(true)}
                            variant="body2"
                            sx={{ cursor: 'pointer' }}
                        >
                            Already have an account? Sign in
                        </Link>
                    </Grid>
                </Grid>
            </Box>

            <Dialog
                open={open}
                onClose={() => {
                    setOpen(false);
                    navigate('/');
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {'Request Received'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Your request has been received. You will be contacted
                        when approved.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpen(false);
                            navigate('/');
                        }}
                        color="primary"
                        autoFocus
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SignUp;
