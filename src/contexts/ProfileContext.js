import { createContext } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { useQuestionsManager } from '../hooks/useQuestionsManager';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const questionsManager = useQuestionsManager(backendUrl);

    return (
        <ProfileContext.Provider
            value={{
                ...questionsManager,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};