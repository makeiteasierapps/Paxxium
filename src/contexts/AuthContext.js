import { createContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useSnackbar } from './SnackbarContext';

const backendUrl =
    process.env.NODE_ENV === 'development'
        ? `http://${process.env.REACT_APP_BACKEND_URL}`
        : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

let auth;

const fetchFirebaseConfig = async () => {
    try {
        const response = await fetch(`${backendUrl}/auth_check`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `Failed to fetch Firebase config: ${response.status} ${response.statusText}. ${errorBody}`
            );
        }

        const config = await response.json();
        return config;
    } catch (error) {
        console.error('Error fetching Firebase config:', error);
        throw error;
    }
};

const initializeFirebase = async () => {
    try {
        const firebaseConfig = await fetchFirebaseConfig();
        initializeApp(firebaseConfig);
        auth = getAuth();
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { showSnackbar } = useSnackbar();
    const [idToken, setIdToken] = useState(null);
    const [uid, setUid] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initFirebase = async () => {
            try {
                await initializeFirebase();
                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing Firebase:', error);
                showSnackbar(
                    `Failed to initialize Firebase: ${error.message}`,
                    'error'
                );
            }
        };
        initFirebase();
    }, [showSnackbar]);

    useEffect(() => {
        if (isInitialized) {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    try {
                        const token = await user.getIdToken();
                        setIdToken(token);
                        setUid(user.uid);
                        setUser(user);
                        showSnackbar('Successfully signed in', 'success');
                    } catch (error) {
                        showSnackbar(
                            `Error getting user token: ${error.message}`,
                            'error'
                        );
                    }
                } else {
                    setIdToken(null);
                    setUid(null);
                    setUser(null);
                }
            });
            return () => unsubscribe();
        }
    }, [isInitialized, showSnackbar]);

    const updatePassword = async (newPassword) => {
        try {
            const response = await fetch(`${backendUrl}/update_password`, {
                method: 'POST',
                body: JSON.stringify({ newPassword, uid }),
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(
                    `Failed to change password: ${response.status} ${response.statusText}. ${errorBody}`
                );
            }
            showSnackbar('Password changed successfully', 'success');
            return true;
        } catch (error) {
            console.error('Error changing password:', error);
            showSnackbar(
                `Failed to change password: ${error.message}`,
                'error'
            );
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                idToken,
                setIdToken,
                uid,
                setUid,
                setUser,
                user,
                isAuthorized,
                setIsAuthorized,
                updatePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { auth };
