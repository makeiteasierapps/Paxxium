import { createContext } from 'react';
import { useImageManager } from '../hooks/useImageManager';

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const imageManager = useImageManager();

    return (
        <ImageContext.Provider
            value={{
                ...imageManager,
                backendUrl,
            }}
        >
            {children}
        </ImageContext.Provider>
    );
};
