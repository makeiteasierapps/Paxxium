import { useContext, useEffect, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import ProjectManager from './ProjectManager';
import { AuthContext } from '../../contexts/AuthContext';
import { SystemContext } from '../../contexts/SystemContext';
import { ContextManagerProvider } from '../../contexts/ContextManagerContext';
import { MainContext } from '../../contexts/MainContext';
import SystemAgent from './SystemAgent';

const SystemDash = () => {
    const { fetchConfigFiles, checkSystemHealth } = useContext(SystemContext);
    const { uid } = useContext(AuthContext);
    const { isDrawerExpanded } = useContext(MainContext);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchConfigFiles(uid);
        checkSystemHealth();
        const healthCheckInterval = setInterval(() => {
            checkSystemHealth();
        }, 30000);
        return () => clearInterval(healthCheckInterval);
    }, [uid, fetchConfigFiles, checkSystemHealth]);

    if (!uid) {
        return null;
    }

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <ContextManagerProvider type="system">
            <Box
                sx={{
                    position: 'fixed',
                    top: 50,
                    left: isDrawerExpanded ? 150 : 50,
                    right: 0,
                    bgcolor: 'background.paper',
                    zIndex: 500,
                }}
            >
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="System Agent" />
                    <Tab label="Project Manager" />
                </Tabs>
            </Box>

            <Box sx={{ mt: '48px' }}> 
                {activeTab === 0 ? (
                    <SystemAgent />
                ) : (
                    <ProjectManager />
                )}
            </Box>
        </ContextManagerProvider>
    );
};

export default SystemDash;
