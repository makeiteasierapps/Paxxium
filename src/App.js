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
import AuthScreen from './auth/AuthScreen';
import ChatDash from './dashboards/chat/ChatDash';
import ImageDash from './dashboards/image/ImageDash';
import ProfileDash from './dashboards/profile/ProfileDash';
import HomeDash from './dashboards/home/HomeDash';
import KbDash from './dashboards/knowledgeBase/KbDash';
import SettingsDash from './dashboards/settings/SettingsDash';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ImageProvider } from './contexts/ImageContext';
import { ChatProvider } from './contexts/ChatContext';
import { NewsProvider } from './contexts/NewsContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { SocketProvider } from './contexts/SocketProvider';
import { MainProvider } from './contexts/MainContext';
import { ConfigProvider } from './contexts/ConfigContext';
import MainContent from './dashboards/main/MainContent';
import SnackbarWrapper from './utils/SnackbarWrapper';
import { SettingsProvider } from './contexts/SettingsContext';
import { KbProvider } from './contexts/KbContext';
import Header from './dashboards/main/Header';
import SideDrawer from './dashboards/main/SideDrawer';
import SystemSettingsDash from './dashboards/system/SystemSettingsDash';
const drawerWidth = 50;
const expandedDrawerWidth = 150;

const AuthenticatedApp = () => {
    const { uid, user, setUid, isAuthorized, setIsAuthorized } =
        useContext(AuthContext);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Check local storage for persisted authorization state on component mount
    useEffect(() => {
        const persistedIsAuthorized =
            localStorage.getItem('isAuthorized') === 'true';
        setIsAuthorized(persistedIsAuthorized);
        setInitialCheckDone(true);
    }, [setIsAuthorized]);

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
                    <MainProvider>
                        <ChatProvider>
                            <SideDrawer
                                mobileOpen={mobileOpen}
                                setMobileOpen={setMobileOpen}
                                drawerWidth={drawerWidth}
                                expandedDrawerWidth={expandedDrawerWidth}
                            />
                            <Header setMobileOpen={setMobileOpen} />
                            <MainContent
                                drawerWidth={drawerWidth}
                                expandedDrawerWidth={expandedDrawerWidth}
                            >
                                <Routes>
                                    {['/', '/home'].map((path, i) => (
                                        <Route
                                            path={path}
                                            element={<HomeDash />}
                                            key={i}
                                        />
                                    ))}
                                    <Route
                                        path="/chat"
                                        element={<ChatDash />}
                                    />
                                    <Route
                                        path="/dalle"
                                        element={<ImageDash />}
                                    />
                                    <Route
                                        path="/profile"
                                        element={<ProfileDash />}
                                    />
                                    <Route path="/kb" element={<KbDash />} />
                                    <Route
                                        path="/settings"
                                        element={<SettingsDash />}
                                    />
                                    <Route
                                        path="/settings/system"
                                        element={<SystemSettingsDash />}
                                    />
                                </Routes>
                            </MainContent>
                        </ChatProvider>
                    </MainProvider>
                </>
            )}
            {!isAuthorized && (
                <Routes>
                    <Route path="/" element={<AuthScreen />} />
                    <Route path="*" element={<Navigate replace to="/" />} />
                </Routes>
            )}
        </>
    );
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarWrapper>
                <AuthProvider>
                    <SettingsProvider>
                        <Router>
                            <SocketProvider>
                                <ConfigProvider>
                                    <NewsProvider>
                                        <ImageProvider>
                                            <KbProvider>
                                                <ProfileProvider>
                                                    <AuthenticatedApp />
                                                </ProfileProvider>
                                            </KbProvider>
                                        </ImageProvider>
                                    </NewsProvider>
                                </ConfigProvider>
                            </SocketProvider>
                        </Router>
                    </SettingsProvider>
                </AuthProvider>
            </SnackbarWrapper>
        </ThemeProvider>
    );
};

export default App;
