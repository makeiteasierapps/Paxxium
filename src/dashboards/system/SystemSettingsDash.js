import { useContext, useEffect, useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ConfigFileList from './ConfigFileList';
import ConfigFileEditor from './ConfigFileEditor';
import Chat from '../chat/components/Chat';
import NewFileMenu from './NewFileMenu';
import { AuthContext } from '../../contexts/AuthContext';
import { useConfig } from '../../hooks/useConfigManager';

const SystemSettingsDash = () => {
    const { fetchConfigFiles } = useConfig();
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
        <Box
            className="system-settings-dash"
            sx={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
            }}
        >
            <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Files" />
                <Tab label="Chat" />
            </Tabs>
            {tabValue === 0 && (
                <>
                    <ConfigFileList />
                    <NewFileMenu />
                    <ConfigFileEditor uid={uid} />
                </>
            )}
            {tabValue === 1 && <Chat />}
        </Box>
    );
};

export default SystemSettingsDash;