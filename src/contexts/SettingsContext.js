import { createContext } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { useSettingsManager } from '../hooks/useSettingsManager';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    
    const settingsManager = useSettingsManager(backendUrl);

    return (
        <SettingsContext.Provider
            value={{
                ...settingsManager,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
