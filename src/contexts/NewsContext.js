import { createContext } from 'react';
import { useNewsManager } from '../hooks/useNewsManager';

export const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
    const newsManager = useNewsManager();
    return (
        <NewsContext.Provider value={{ ...newsManager }}>
            {children}
        </NewsContext.Provider>
    );
};
