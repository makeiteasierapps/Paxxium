import { useState, createContext } from 'react';

export const MainContext = createContext();

export const MainProvider = ({ children }) => {
    const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

    return (
        <MainContext.Provider value={{ isDrawerExpanded, setIsDrawerExpanded }}>
            {children}
        </MainContext.Provider>
    );
};
