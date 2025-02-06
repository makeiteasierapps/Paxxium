import { createContext, useContext } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { useQuestionsManager } from '../hooks/useQuestionsManager';
import { AuthContext } from './AuthContext';
import { useSnackbar } from './SnackbarContext';

export const InsightContext = createContext();

export const InsightProvider = ({ children }) => {
    const { uid } = useContext(AuthContext);
    const { showSnackbar } = useSnackbar();
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const questionsManager = useQuestionsManager(backendUrl, uid, showSnackbar);

    return (
        <InsightContext.Provider
            value={{
                ...questionsManager,
                backendUrl,
            }}
        >
            {children}
        </InsightContext.Provider>
    );
};
