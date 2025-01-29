import { useContext, useEffect, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import ProjectManager from './ProjectManager';
import { AuthContext } from '../../contexts/AuthContext';
import { SystemContext } from '../../contexts/SystemContext';
import { ContextManagerProvider } from '../../contexts/ContextManagerContext';
import { MainContainer } from '../styledComponents/DashStyledComponents';
import SystemAgent from './SystemAgent';

const SystemDash = () => {
    const { fetchConfigFiles, checkSystemHealth } = useContext(SystemContext);
    const { uid } = useContext(AuthContext);
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
            <MainContainer
                alignItems="left"
                sx={{ maxWidth: '1200px', alignItems: 'flex-start' }}
            >
                <Box sx={{ borderColor: 'divider', mb: 2 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="System Agent" />
                        <Tab label="Project Manager" />
                    </Tabs>
                </Box>

                {activeTab === 0 ? (
                    <>
                        <SystemAgent />
                    </>
                ) : (
                    <ProjectManager />
                )}
            </MainContainer>
        </ContextManagerProvider>
    );
};

export default SystemDash;
