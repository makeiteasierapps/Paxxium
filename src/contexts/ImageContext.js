import { createContext } from 'react';

import { useImageManager } from '../hooks/useImageManager';

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
    const imageManager = useImageManager();

    return (
        <ImageContext.Provider
            value={{
                ...imageManager,
            }}
        >
            {children}
        </ImageContext.Provider>
    );
};
