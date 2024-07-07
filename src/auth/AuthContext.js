import { createContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const backendUrl =
    process.env.NODE_ENV === 'development'
        ? `http://${process.env.REACT_APP_BACKEND_URL}`
        : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

let auth;

const fetchFirebaseConfig = async () => {
    const response = await fetch(`${backendUrl}/auth_check`);
    const config = await response.json();
    return config;
};

const initializeFirebase = async () => {
    const firebaseConfig = await fetchFirebaseConfig();
    initializeApp(firebaseConfig);
    auth = getAuth();
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [idToken, setIdToken] = useState(null);
    const [uid, setUid] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initFirebase = async () => {
            await initializeFirebase();
            setIsInitialized(true);
        };
        initFirebase();
    }, []);

    useEffect(() => {
        if (isInitialized) {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const token = await user.getIdToken();
                    setIdToken(token);
                    setUid(user.uid);
                    setUser(user);
                } else {
                    console.log('No user is signed in.');
                }
            });
            return () => unsubscribe();
        }
    }, [isInitialized]);

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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { auth };
