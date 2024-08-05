import { createContext, useContext } from 'react';
import { useNewsManager } from '../hooks/useNewsManager';
import { useSnackbar } from './SnackbarContext';
import { AuthContext } from './AuthContext';

export const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
    const backendUrl =
    process.env.NODE_ENV === "development"
      ? `http://${process.env.REACT_APP_BACKEND_URL}`
      : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;
    const { showSnackbar } = useSnackbar();
    const { uid } = useContext(AuthContext);
    const newsManager = useNewsManager(uid, showSnackbar, backendUrl);

    return (
        <NewsContext.Provider value={{ ...newsManager }}>
            {children}
        </NewsContext.Provider>
    );
};
