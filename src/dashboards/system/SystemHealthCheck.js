import { useState, useContext, useEffect } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/material/styles';
import { SystemContext } from '../../contexts/SystemContext';
import { StyledIconButton } from '../chat/chatStyledComponents';

const ServiceGroup = styled(Box)(({ theme, expanded }) => ({
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 10000,
    height: expanded ? 'auto' : '25px',
    width: expanded ? '250px' : '100px',
    boxShadow: theme.shadows[4],
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    paddingLeft: theme.spacing(2),
    transition: 'all 0.3s ease',
}));

const ServiceItem = styled(Box)(({ theme, status }) => ({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor:
        status === 'active'
            ? 'rgba(46, 125, 50, 0.1)'
            : status === 'inactive'
            ? 'rgba(211, 47, 47, 0.1)'
            : 'rgba(237, 108, 2, 0.1)',
}));

const StatusIcon = ({ status }) => {
    if (status === 'active') {
        return <CheckCircleIcon sx={{ color: '#2e7d32' }} />;
    } else if (status === 'inactive') {
        return <ErrorIcon sx={{ color: '#d32f2f' }} />;
    }
    return <WarningIcon sx={{ color: '#ed6c02' }} />;
};

const SystemHealthCheck = () => {
    const [expanded, setExpanded] = useState(false);
    const { systemHealth } = useContext(SystemContext);

    const services = systemHealth || {};
    const totalServices = Object.keys(services).length;
    const activeServices = Object.values(services).filter(
        (status) => status === 'active'
    ).length;
    const healthScore = (activeServices / totalServices) * 100;

    const getHealthColor = (score) => {
        if (score >= 80) return '#2e7d32';
        if (score >= 60) return '#ed6c02';
        return '#d32f2f';
    };

    return (
        <ServiceGroup expanded={expanded}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography
                    sx={{
                        color: getHealthColor(healthScore),
                        fontWeight: 'bold',
                    }}
                >
                    {healthScore.toFixed(0)}%
                </Typography>

                <StyledIconButton onClick={() => setExpanded(!expanded)}>
                    <ExpandMoreIcon
                        sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
                    />
                </StyledIconButton>
            </Box>

            <Collapse in={expanded}>
                {Object.entries(services).map(([service, status]) => (
                    <ServiceItem key={service} status={status}>
                        <StatusIcon status={status} />
                        <Typography sx={{ ml: 1 }}>{service}</Typography>
                    </ServiceItem>
                ))}
            </Collapse>
        </ServiceGroup>
    );
};

export default SystemHealthCheck;
