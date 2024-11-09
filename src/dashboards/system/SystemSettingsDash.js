import { useContext, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import ConfigFileMenu from './ConfigFileMenu';
import ConfigFileEditor from './ConfigFileEditor';
import { AuthContext } from '../../contexts/AuthContext';
import { SystemContext } from '../../contexts/SystemContext';
import { MainContainer } from '../../dashboards/styledComponents/DashStyledComponents';
import ContextResearch from './ContextResearch';
import SystemHealthCheck from './SystemHealthCheck';
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
    }, [uid, fetchConfigFiles, checkSystemHealth]);

    if (!uid) {
        return null;
    }

    return (
        <MainContainer>
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <Typography variant="h4">SystemDash</Typography>
            </Box>

            

            <Box
                sx={{
                    width: '100%',
                }}
            >
                <ConfigFileMenu />
                <SystemHealthCheck />
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
