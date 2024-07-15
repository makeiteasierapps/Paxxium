import { createContext } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { useProfileManager } from '../hooks/useProfileManager';
import { useQuestionsManager } from '../hooks/useQuestionsManager';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const profileManager = useProfileManager(backendUrl);
    const questionsManager = useQuestionsManager(backendUrl);

    return (
        <ProfileContext.Provider
            value={{
                ...profileManager,
                ...questionsManager,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};
