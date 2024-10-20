import { useContext, useEffect, useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ConfigFileList from './ConfigFileList';
import ConfigFileEditor from './ConfigFileEditor';
import Chat from '../chat/components/Chat';
import NewFileMenu from './NewFileMenu';
import { AuthContext } from '../../contexts/AuthContext';
import { SystemContext } from '../../contexts/SystemContext';
import ContextResearch from './ContextResearch';
const SystemSettingsDash = () => {
    const { fetchConfigFiles, systemAgentMessages, messageSystemAgent } =
        useContext(SystemContext);
    const { uid } = useContext(AuthContext);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchConfigFiles(uid);
    }, [uid, fetchConfigFiles]);

    if (!uid) {
        return null;
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <>
            <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Files" />
                <Tab label="Chat" />
            </Tabs>
            <Box
                className="system-settings-dash"
                gap={2}
                sx={{
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {tabValue === 0 && (
                    <>
                        <ConfigFileList />
                        <NewFileMenu />
                        <ConfigFileEditor uid={uid} />
                    </>
                )}
                {tabValue === 1 && (
                    <Box width="100%">
                        <ContextResearch />
                        <Chat
                            sx={{
                                width: '100%',
                                height: '90vh',
                            }}
                            messages={systemAgentMessages}
                            onSendMessage={messageSystemAgent}
                        />
                    </Box>
                )}
            </Box>
        </>
    );
};

export default SystemSettingsDash;
