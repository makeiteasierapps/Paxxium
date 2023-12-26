import React, { useState } from 'react';
import {
    Box,
    Drawer,
    Typography,
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
import { Link, useLocation } from 'react-router-dom';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import paxxiumLogo from '../../assets/images/paxxium-logo.png';
import paxxiumTextLogo from '../../assets/images/paxxium-logo-text-only.png';

import { HeaderIconButton } from './mainStyledComponents';

const SideDrawer = ({
    mobileOpen,
    setMobileOpen,
    drawerWidth,
    handleDrawerExpand,
    isDrawerExpanded,
    expandedDrawerWidth,
}) => {
    const location = useLocation();
    const [popOverAnchor, setPopOverAnchor] = useState(null);
    const [agentsOpen, setAgentsOpen] = useState(false);

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
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <HomeIcon sx={{ fontSize: '2rem' }} />
                    {isDrawerExpanded && (
                        <Typography paddingLeft={1}>Home</Typography>
                    )}
                </Box>
            </HeaderIconButton>
        </ConditionalTooltip>
    );

    const profileButton = (
        <ConditionalTooltip title="Profile" condition={!isDrawerExpanded}>
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
        </ConditionalTooltip>
    );

    const AgentMenuItems = () => (
        <>
            <MenuItem
                onClick={() => setPopOverAnchor(null)}
                component={Link}
                to="/agents"
            >
                Chat
            </MenuItem>
            <MenuItem
                onClick={() => setPopOverAnchor(null)}
                component={Link}
                to="/dalle"
            >
                Image
            </MenuItem>
        </>
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

                {!isDrawerExpanded ? (
                    <>
                        <Tooltip title="Agents" placement="right">
                            <HeaderIconButton
                                disableRipple
                                onClick={(event) => {
                                    setPopOverAnchor(event.currentTarget);
                                }}
                                currentPath={location.pathname}
                                to="/agents"
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
                                        <Typography
                                            paddingLeft={1}
                                            paddingRight={1}
                                        >
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
                        </Tooltip>
                        <Popover
                            open={Boolean(popOverAnchor)}
                            anchorEl={popOverAnchor}
                            onClick={() => setPopOverAnchor(null)}
                        >
                            <AgentMenuItems />
                        </Popover>
                    </>
                ) : (
                    <>
                        <HeaderIconButton
                            disableRipple
                            onClick={(event) => {
                                setAgentsOpen(!agentsOpen);
                            }}
                            currentPath={location.pathname}
                            to="/agents"
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
                                    <Typography
                                        paddingLeft={1}
                                        paddingRight={1}
                                    >
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
                            <AgentMenuItems />
                        </Collapse>
                    </>
                )}

                {profileButton}
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
