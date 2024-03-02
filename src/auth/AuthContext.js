import { createContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

// Get a reference to the Firebase auth service
export const auth = getAuth();
export const AuthContext = createContext();
export const backendUrl =
    process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_BACKEND_URL_PROD
        : process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
    const [idToken, setIdToken] = useState(null);
    const [uid, setUid] = useState(null);
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onIdTokenChanged(async function (user) {
            if (user) {
                // User is signed in or their token has been refreshed.
                const token = await user.getIdToken();
                setIdToken(token); // Update the ID token in your state.
                setUid(user.uid); // Update the user's UID in your state.
                setUser(user); // Update the user object in your state.
            } else {
                // User is signed out.
                console.log('No user is signed in.');
            }
        });
        return () => unsubscribe();
    }, []);
    return (
        <AuthContext.Provider
            value={{
                idToken,
                setIdToken,
                uid,
                setUid,
                setUser,
                user,
                username,
                setUsername,
                isAuthorized,
                setIsAuthorized,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
