import React, { useContext } from 'react';
import { Box, Drawer, Typography, Tooltip } from '@mui/material';
import {
    Home as HomeIcon,
    SettingsApplications as SettingsIcon,
    Psychology as PsychologyIcon,
    AccountTree as AccountTreeIcon,
    Logout as LogoutIcon,
    Chat as ChatIcon,
    Collections as CollectionsIcon,
} from '@mui/icons-material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { Link, useLocation } from 'react-router-dom';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import paxxiumLogo from '../../assets/images/paxxium-logo.png';
import paxxiumTextLogo from '../../assets/images/paxxium-logo-text-only.png';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AuthContext, auth } from '../../contexts/AuthContext';
import { MainContext } from '../../contexts/MainContext';
import { HeaderIconButton } from './mainStyledComponents';

const SideDrawer = ({
    mobileOpen,
    setMobileOpen,
    drawerWidth,
    expandedDrawerWidth,
}) => {
    const { isDrawerExpanded, setIsDrawerExpanded } = useContext(MainContext);
    const handleDrawerExpand = () => {
        setIsDrawerExpanded(!isDrawerExpanded);
    };
    const location = useLocation();
    const navigate = useNavigate();
    const { setIdToken, setUser, setIsAuthorized } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIdToken(null);
            setUser(null);
            setIsAuthorized(false);
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    const ConditionalTooltip = ({ children, title, condition }) => {
        return condition ? (
            <Tooltip title={title} placement="right">
                {children}
            </Tooltip>
        ) : (
            children
        );
    };

    const homeButton = (
        <ConditionalTooltip title="Home" condition={!isDrawerExpanded}>
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/home"
                currentPath={location.pathname}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <HomeIcon sx={{ fontSize: '2rem' }} />
                    {isDrawerExpanded && (
                        <Typography paddingLeft={1}>Home</Typography>
                    )}
                </Box>
            </HeaderIconButton>
        </ConditionalTooltip>
    );

    const systemSettingsButton = (
        <ConditionalTooltip
            title="System Settings"
            condition={!isDrawerExpanded}
        >
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/settings/system"
                currentPath={location.pathname}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <SettingsIcon sx={{ fontSize: '2rem' }} />
                    {isDrawerExpanded && (
                        <Typography paddingLeft={1}>System Settings</Typography>
                    )}
                </Box>
            </HeaderIconButton>
        </ConditionalTooltip>
    );

    const insightButton = (
        <ConditionalTooltip title="InsightDash" condition={!isDrawerExpanded}>
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/insight"
                currentPath={location.pathname}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <TipsAndUpdatesIcon sx={{ fontSize: '2rem' }} />
                    {isDrawerExpanded && (
                        <Typography paddingLeft={1}>InsightDash</Typography>
                    )}
                </Box>
            </HeaderIconButton>
        </ConditionalTooltip>
    );

    const KbButton = (
        <ConditionalTooltip
            title="Knowledge Base"
            condition={!isDrawerExpanded}
        >
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/kb"
                currentPath={location.pathname}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <AccountTreeIcon sx={{ fontSize: '2rem' }} />
                    {isDrawerExpanded && (
                        <Typography
                            sx={{
                                ml: 1,
                                fontSize: '0.9rem',
                                lineHeight: 1.2,
                                whiteSpace: 'normal',
                                wordWrap: 'break-word',
                            }}
                        >
                            Knowledge
                            <br />
                            Base
                        </Typography>
                    )}
                </Box>
            </HeaderIconButton>
        </ConditionalTooltip>
    );

    const userAccountButton = (
        <ConditionalTooltip title="Account" condition={!isDrawerExpanded}>
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/account"
                currentPath={location.pathname}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <PsychologyIcon sx={{ fontSize: '2rem' }} />
                    {isDrawerExpanded && (
                        <Typography paddingLeft={1}>Account</Typography>
                    )}
                </Box>
            </HeaderIconButton>
        </ConditionalTooltip>
    );

    const logoutButton = (
        <ConditionalTooltip title="Logout" condition={!isDrawerExpanded}>
            <HeaderIconButton
                disableRipple
                id="logout-button"
                onClick={handleLogout}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <LogoutIcon sx={{ fontSize: '2rem' }} />
                    {isDrawerExpanded && (
                        <Typography paddingLeft={1}>Logout</Typography>
                    )}
                </Box>
            </HeaderIconButton>
        </ConditionalTooltip>
    );

    const chatsButton = (
        <ConditionalTooltip title="Chats" condition={!isDrawerExpanded}>
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/chat"
                currentPath={location.pathname}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <ChatIcon sx={{ fontSize: '2rem' }} />
                    {isDrawerExpanded && (
                        <Typography paddingLeft={1}>Chats</Typography>
                    )}
                </Box>
            </HeaderIconButton>
        </ConditionalTooltip>
    );

    const imageGalleryButton = (
        <ConditionalTooltip title="Image Gallery" condition={!isDrawerExpanded}>
            <HeaderIconButton
                disableRipple
                component={Link}
                to="/dalle"
                currentPath={location.pathname}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CollectionsIcon sx={{ fontSize: '2rem' }} />
                        {isDrawerExpanded && (
                            <Typography
                                sx={{
                                    ml: 1,
                                    fontSize: '0.9rem',
                                    lineHeight: 1.2,
                                    whiteSpace: 'normal',
                                    wordWrap: 'break-word',
                                }}
                            >
                                Image
                                <br />
                                Gallery
                            </Typography>
                        )}
                    </Box>
                </Box>
            </HeaderIconButton>
        </ConditionalTooltip>
    );

    const drawer = (
        <Box
            sx={{
                display: 'flex',
                p: '5px',
                width: {
                    sm: isDrawerExpanded ? expandedDrawerWidth : drawerWidth,
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isDrawerExpanded ? 'flex-start' : 'center',
                    width: '100%',
                }}
            >
                {/* Logo */}
                {!isDrawerExpanded ? (
                    <Box
                        component={'img'}
                        src={paxxiumLogo}
                        width="50px"
                        sx={{
                            display: 'flex',
                            padding: '8px',
                        }}
                        alt="logo"
                    />
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            paddingBottom: '20px',
                        }}
                    >
                        <Box
                            component={'img'}
                            src={paxxiumLogo}
                            width="50px"
                            sx={{
                                display: 'flex',
                                padding: '5px',
                            }}
                            alt="logo"
                        />
                        <Box
                            component={'img'}
                            src={paxxiumTextLogo}
                            width="80px"
                            sx={{
                                display: 'flex',
                                paddingLeft: '7px',
                            }}
                            alt="logo"
                        />
                    </Box>
                )}

                {/* Menu Items */}
                {homeButton}
                {imageGalleryButton}
                {insightButton}
                {KbButton}
                {userAccountButton}
                {chatsButton}
                {systemSettingsButton}
                {logoutButton}
            </Box>
        </Box>
    );

    return (
        <>
            <Drawer
                anchor="left"
                variant="temporary"
                open={mobileOpen}
                onClose={setMobileOpen}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                }}
            >
                {drawer}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isDrawerExpanded ? 'flex-end' : 'center',
                        width: '100%',
                        padding: isDrawerExpanded ? '10px' : '0px',
                    }}
                >
                    <HeaderIconButton
                        disableRipple
                        onClick={() => {
                            setMobileOpen(false);
                        }}
                    >
                        <KeyboardArrowLeft />
                    </HeaderIconButton>
                </Box>
            </Drawer>
            <Drawer
                anchor="left"
                id="mobileDrawer"
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                }}
                open
            >
                {drawer}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isDrawerExpanded ? 'flex-end' : 'center',
                        width: '100%',
                        padding: isDrawerExpanded ? '10px' : '0px',
                    }}
                >
                    <HeaderIconButton
                        disableRipple
                        onClick={handleDrawerExpand}
                    >
                        {isDrawerExpanded ? (
                            <KeyboardArrowLeft />
                        ) : (
                            <KeyboardArrowRight />
                        )}
                    </HeaderIconButton>
                </Box>
            </Drawer>
        </>
    );
};

export default SideDrawer;
