import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';
import theme from './Theme';
import { AuthContext, AuthProvider, backendUrl } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import SignUpPage from './auth/SignUpPage';
import AgentDash from './dashboards/agent/AgentDash';
import ImageDash from './dashboards/agent/image/ImageDash';
import { ImageProvider } from './dashboards/agent/image/ImageContext';
import { ChatProvider } from './dashboards/agent/chat/ChatContext';
import HomeDash from './dashboards/home/HomeDash';
import { NewsProvider } from './dashboards/home/news/NewsContext';
import Header from './dashboards/main/Header';
import SideDrawer from './dashboards/main/SideDrawer';
import { ProfileProvider } from './dashboards/profile/ProfileContext';
import ProfileDash from './dashboards/profile/ProfileDash';



const drawerWidth = 50;
const expandedDrawerWidth = 150;

const AuthenticatedApp = () => {
    const db = getFirestore();
    const {
        idToken,
        uid,
        user,
        setUid,
        setUsername,
        isAuthorized,
        setIsAuthorized,
    } = useContext(AuthContext);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDrawerExpanded, setDrawerExpanded] = useState(false);
    const isAuth = localStorage.getItem('isAuthorized') === 'true';

    const handleDrawerExpand = () => {
        setDrawerExpanded(!isDrawerExpanded);
    };
    // Fetches auth status from the db then loads the user into state.
    useEffect(() => {
        if (isAuthorized) return;
        const fetchData = async () => {
            if (idToken && user) {
                try {
                    const response = await fetch(`${backendUrl}/auth_check`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: idToken,
                        },
                        body: JSON.stringify({
                            uid: uid,
                        }),
                    });

                    const responseData = await response.json();

                    // Checks if admin has grtanted access to the app
                    if (responseData.auth_status) {
                        setIsAuthorized(true);
                        localStorage.setItem('isAuthorized', 'true');
                        setUid(user.uid);
                        const userDoc = await getDoc(doc(db, 'users', uid));
                        if (!userDoc.exists()) {
                            throw new Error('No user found in Firestore');
                        }
                        setUsername(userDoc.data().username);
                    }
                } catch (error) {
                    console.error('Failed to fetch:', error);
                }
            }
        };

        fetchData();
    }, [db, idToken, setUid, setUsername, user, uid, setIsAuthorized]);

    return (
        <>
            {isAuth && (
                <>
                    <SideDrawer
                        mobileOpen={mobileOpen}
                        setMobileOpen={setMobileOpen}
                        drawerWidth={drawerWidth}
                        handleDrawerExpand={handleDrawerExpand}
                        isDrawerExpanded={isDrawerExpanded}
                        setDrawerExpanded={setDrawerExpanded}
                        expandedDrawerWidth={expandedDrawerWidth}
                    />
                    <Header
                        setMobileOpen={setMobileOpen}
                        setDrawerExpanded={setDrawerExpanded}
                    />
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: 3,
                            ml: {
                                sm: isDrawerExpanded
                                    ? `${expandedDrawerWidth}px`
                                    : `${drawerWidth}px`,
                            },
                        }}
                    >
                        <Routes>
                            {['/', '/home'].map((path, i) => (
                                <Route
                                    path={path}
                                    element={
                                        <NewsProvider>
                                            <HomeDash />
                                        </NewsProvider>
                                    }
                                    key={i}
                                />
                            ))}
                            <Route
                                path="/agents"
                                element={
                                    <ProfileProvider>
                                        <ChatProvider>
                                            <AgentDash />
                                        </ChatProvider>
                                    </ProfileProvider>
                                }
                            />
                            <Route
                                path="/dalle"
                                element={
                                    <ImageProvider>
                                        <ImageDash />
                                    </ImageProvider>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProfileProvider>
                                        <ProfileDash />
                                    </ProfileProvider>
                                }
                            />
                        </Routes>
                    </Box>
                </>
            )}
            {!isAuth && (
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="*" element={<Navigate replace to="/" />} />
                    <Route path="/signup" element={<SignUpPage />} />
                </Routes>
            )}
        </>
    );
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <AuthenticatedApp />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
