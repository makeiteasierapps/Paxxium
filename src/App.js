import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';
import theme from './Theme';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import SignUpPage from './auth/SignUpPage';
import AgentDash from './dashboards/agents/AgentDash';
import ImageDash from './dashboards/agents/image/ImageDash';
import ProfileDash from './dashboards/profile/ProfileDash';
import HomeDash from './dashboards/home/HomeDash';
import ProjectsDash from './dashboards/projects/ProjectsDash';
import { ImageProvider } from './dashboards/agents/image/ImageContext';
import { ChatProvider } from './dashboards/agents/chat/ChatContext';
import { NewsProvider } from './dashboards/home/news/NewsContext';
import { ProfileProvider } from './dashboards/profile/ProfileContext';
import { SnackbarProvider } from './SnackbarContext';
import { ProjectProvider } from './dashboards/projects/ProjectContext';
import Header from './dashboards/main/Header';
import SideDrawer from './dashboards/main/SideDrawer';

const drawerWidth = 50;
const expandedDrawerWidth = 150;

const AuthenticatedApp = () => {
    const { uid, user, setUid, isAuthorized, setIsAuthorized } =
        useContext(AuthContext);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDrawerExpanded, setDrawerExpanded] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Check local storage for persisted authorization state on component mount
    useEffect(() => {
        const persistedIsAuthorized =
            localStorage.getItem('isAuthorized') === 'true';
        setIsAuthorized(persistedIsAuthorized);
        setInitialCheckDone(true);
    }, [setIsAuthorized]);

    const handleDrawerExpand = () => {
        setDrawerExpanded(!isDrawerExpanded);
    };

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    useEffect(() => {
        if (isAuthorized) return;
        const fetchData = async () => {
            if (user) {
                try {
                    const response = await fetch(`${backendUrl}/auth_check`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            dbName: process.env.REACT_APP_DB_NAME,
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
                    }
                } catch (error) {
                    console.error('Failed to fetch:', error);
                }
            }
        };

        fetchData();
    }, [setUid, user, uid, setIsAuthorized, isAuthorized, backendUrl]);

    if (!initialCheckDone) {
        return null;
    }

    return (
        <>
            {isAuthorized && (
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
                                    element={<HomeDash />}
                                    key={i}
                                />
                            ))}
                            <Route path="/agents" element={<AgentDash />} />
                            <Route path="/dalle" element={<ImageDash />} />
                            <Route path="/profile" element={<ProfileDash />} />
                            <Route
                                path="/projects"
                                element={<ProjectsDash />}
                            />
                        </Routes>
                    </Box>
                </>
            )}
            {!isAuthorized && (
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
            <SnackbarProvider>
                <AuthProvider>
                    <Router>
                        <NewsProvider>
                            <ImageProvider>
                                <ChatProvider>
                                    <ProfileProvider>
                                        <ProjectProvider>
                                            <AuthenticatedApp />
                                        </ProjectProvider>
                                    </ProfileProvider>
                                </ChatProvider>
                            </ImageProvider>
                        </NewsProvider>
                    </Router>
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
