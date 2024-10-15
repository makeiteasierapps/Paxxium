import { useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import ConfigFileList from './ConfigFileList';
import ConfigFileEditor from './ConfigFileEditor';
import NewFileMenu from './NewFileMenu';
import { AuthContext } from '../../contexts/AuthContext';
import { useConfig } from '../../hooks/useConfigManager';

const SystemSettingsDash = () => {
    const { fetchConfigFiles } = useConfig();
    const { uid } = useContext(AuthContext);

    useEffect(() => {
        fetchConfigFiles(uid);
    }, [uid, fetchConfigFiles]);

    if (!uid) {
        return null;
    }

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
            <ConfigFileList />
            <NewFileMenu />
            <ConfigFileEditor uid={uid} />
        </Box>
    );
};

export default SystemSettingsDash;
