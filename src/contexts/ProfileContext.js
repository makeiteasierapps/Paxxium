import { createContext, useContext } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { useQuestionsManager } from '../hooks/useQuestionsManager';
import { AuthContext } from './AuthContext';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const { uid } = useContext(AuthContext);
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const questionsManager = useQuestionsManager(backendUrl, uid);

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
