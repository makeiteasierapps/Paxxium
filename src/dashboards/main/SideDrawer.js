import React, { useState } from 'react';
import {
    Box,
    Drawer,
    Typography,
    Menu,
    MenuItem,
    Tooltip,
    Popover,
    Collapse,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AgentsIcon from '@mui/icons-material/People';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { HeaderIconButton } from './mainStyledComponents';
import { Link, useLocation } from 'react-router-dom';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import paxxiumLogo from '../../assets/images/paxxium-logo.png';
import paxxiumTextLogo from '../../assets/images/paxxium-logo-text-only.png';

const SideDrawer = ({
    mobileOpen,
    setMobileOpen,
    drawerWidth,
    handleDrawerExpand,
    isDrawerExpanded,
    setDrawerExpanded,
    expandedDrawerWidth,
}) => {
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [agentsOpen, setAgentsOpen] = useState(false);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAgentsClick = (event) => {
        setAgentsOpen(!agentsOpen);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const homeButton = (
        <HeaderIconButton
            disableRipple
            component={Link}
            to="/home"
            currentPath={location.pathname}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <HomeIcon sx={{ fontSize: '2rem' }} />
                {isDrawerExpanded && (
                    <Typography paddingLeft={1}>Home</Typography>
                )}
            </Box>
        </HeaderIconButton>
    );

    const profileButton = (
        <HeaderIconButton
            disableRipple
            component={Link}
            to="/profile"
            currentPath={location.pathname}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <ProfileIcon sx={{ fontSize: '2rem' }} />
                {isDrawerExpanded && (
                    <Typography paddingLeft={1}>Profile</Typography>
                )}
            </Box>
        </HeaderIconButton>
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
                {!isDrawerExpanded ? (
                    <Tooltip title="Home" placement="right">
                        {homeButton}
                    </Tooltip>
                ) : (
                    homeButton
                )}

                {!isDrawerExpanded ? (
                    <>
                        <Tooltip title="Agents" placement="right">
                            <HeaderIconButton
                                disableRipple
                                onClick={handleClick}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                    }}
                                >
                                    <AgentsIcon sx={{ fontSize: '2rem' }} />
                                    {isDrawerExpanded && (
                                        <Typography paddingLeft={1}>
                                            Agents
                                        </Typography>
                                    )}
                                </Box>
                            </HeaderIconButton>
                        </Tooltip>
                        <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                        >
                            <MenuItem
                                onClick={handleClose}
                                component={Link}
                                to="/agents"
                            >
                                Chat
                            </MenuItem>
                            <MenuItem
                                onClick={handleClose}
                                component={Link}
                                to="/dalle"
                            >
                                Image
                            </MenuItem>
                        </Popover>
                    </>
                ) : (
                    <>
                        <HeaderIconButton
                            disableRipple
                            onClick={handleAgentsClick}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <AgentsIcon sx={{ fontSize: '2rem' }} />
                                {isDrawerExpanded && (
                                    <Typography paddingLeft={1} paddingRight={1}>
                                        Agents
                                    </Typography>
                                )}
                                {isDrawerExpanded &&
                                    (agentsOpen ? (
                                        <ExpandLess />
                                    ) : (
                                        <ExpandMore />
                                    ))}
                            </Box>
                        </HeaderIconButton>
                        <Collapse in={agentsOpen}>
                            <MenuItem
                                onClick={handleClose}
                                component={Link}
                                to="/agents"
                            >
                                Chat
                            </MenuItem>
                            <MenuItem
                                onClick={handleClose}
                                component={Link}
                                to="/dalle"
                            >
                                Image
                            </MenuItem>
                        </Collapse>
                    </>
                )}

                {!isDrawerExpanded ? (
                    <Tooltip title="Profile" placement="right">
                        {profileButton}
                    </Tooltip>
                ) : (
                    profileButton
                )}
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
                PaperProps={{
                    style: {
                        backgroundColor: 'black',
                    },
                }}
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
