import { useContext, useEffect } from 'react';
import { Box, Typography, Toolbar } from '@mui/material';
import ConfigFileMenu from './ConfigFileMenu';
import ConfigFileEditor from './ConfigFileEditor';
import { AuthContext } from '../../contexts/AuthContext';
import { SystemContext } from '../../contexts/SystemContext';
import { MainContainer } from '../../dashboards/styledComponents/DashStyledComponents';
import ContextResearch from './ContextResearch';
import SystemHealthCheck from './SystemHealthCheck';
import NewFileMenu from './NewFileMenu';
const SystemSettingsDash = () => {
    const {
        fetchConfigFiles,
        systemAgentMessages,
        messageSystemAgent,
        checkSystemHealth,
    } = useContext(SystemContext);
    const { uid } = useContext(AuthContext);

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

    return (
        <MainContainer>
            <Box
                sx={{
                    width: '100%',
                }}
            >
                <ConfigFileMenu />
            </Box>
            <>
                <ConfigFileEditor uid={uid} />
            </>

            <Box width="100%">
                <ContextResearch />
                {/* <Chat
                    sx={{
                        width: '100%',
                        height: '90vh',
                    }}
                    messages={systemAgentMessages}
                    onSendMessage={messageSystemAgent}
                /> */}
            </Box>
        </MainContainer>
    );
};

export default SystemSettingsDash;
