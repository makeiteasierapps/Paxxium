import { createContext, useContext } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { useSettingsManager } from '../hooks/useSettingsManager';
import { AuthContext } from './AuthContext';
import { useSnackbar } from './SnackbarContext';
export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const { uid } = useContext(AuthContext);
    
    const { showSnackbar } = useSnackbar();
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const settingsManager = useSettingsManager(backendUrl, uid, showSnackbar);

    return (
        <SettingsContext.Provider
            value={{
                ...settingsManager,
                backendUrl,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
