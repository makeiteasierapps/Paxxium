import { useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import ConfigEditor from './ConfigEditor';
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
        <Box>
            <ConfigEditor uid={uid} />
        </Box>
    );
};

export default SystemSettingsDash;
