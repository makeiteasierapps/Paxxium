import React, { useState, useEffect, useRef, useContext } from 'react';
import { TextField, Button, IconButton, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';

const NewPassword = () => {
    const { updatePassword } = useContext(AuthContext);
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const errorRef = useRef('');

    const handleUpdatePassword = async () => {
        if (await updatePassword(passwords.confirm)) {
            setPasswords({ new: '', confirm: '' });
        }
    };

    const handlePasswordChange = (field) => (event) => {
        setPasswords({ ...passwords, [field]: event.target.value });
        errorRef.current = '';
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const generateStrongPassword = () => {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let newPassword = '';
        for (let i = 0; i < 12; i++) {
            newPassword += chars.charAt(
                Math.floor(Math.random() * chars.length)
            );
        }
        setPasswords({ new: newPassword, confirm: newPassword });
    };

    useEffect(() => {
        const validatePasswords = () => {
            if (passwords.confirm === '') {
                // Don't show any error if confirm field is empty
                errorRef.current = '';
                setIsValid(false);
            } else if (passwords.new !== passwords.confirm) {
                errorRef.current = 'Passwords do not match';
                setIsValid(false);
            } else if (passwords.new.length < 8) {
                errorRef.current =
                    'Password must be at least 8 characters long';
                setIsValid(false);
            } else {
                errorRef.current = '';
                setIsValid(true);
            }
        };
        validatePasswords();
    }, [passwords.new, passwords.confirm]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: 400,
                margin: 'auto',
            }}
        >
            <TextField
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={passwords.new}
                onChange={handlePasswordChange('new')}
                fullWidth
                InputProps={{
                    endAdornment: (
                        <IconButton onClick={toggleShowPassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    ),
                }}
            />
            <TextField
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={handlePasswordChange('confirm')}
                fullWidth
                error={!!errorRef.current}
                helperText={errorRef.current}
            />
            <Button variant="outlined" onClick={generateStrongPassword}>
                Generate Strong Password
            </Button>
            <Button
                variant="outlined"
                disabled={!isValid}
                onClick={handleUpdatePassword}
            >
                Change Password
            </Button>
        </Box>
    );
};

export default NewPassword;
