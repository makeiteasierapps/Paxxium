import { createContext, useContext } from 'react';

export const SnackbarContext = createContext();

export const SnackbarProvider = ({ children, value }) => {
    return (
        <SnackbarContext.Provider value={value}>
            {children}
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (context === undefined) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};