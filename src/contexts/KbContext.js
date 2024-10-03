import { useState, createContext, useContext } from 'react';
import { useKbManager } from '../hooks/knowledgeBase/useKbManager';
import { useKbDocManager } from '../hooks/knowledgeBase/useKbDocManager';
import { useExtractionManager } from '../hooks/knowledgeBase/useExtractionManager';
import { AuthContext } from './AuthContext';
import { useSnackbar } from './SnackbarContext';
export const KbContext = createContext();

export const KbProvider = ({ children }) => {
    const [selectedKb, setSelectedKb] = useState(null);
    const [isKbLoading, setIsKbLoading] = useState(false);
    const { uid } = useContext(AuthContext);
    const { showSnackbar } = useSnackbar();
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const kbDocManager = useKbDocManager(
        backendUrl,
        uid,
        showSnackbar,
        selectedKb
    );

    const kbManager = useKbManager(backendUrl, uid, showSnackbar);

    const extractionManager = useExtractionManager(
        backendUrl,
        uid,
        showSnackbar,
        kbDocManager.setKbDocs
    );

    return (
        <KbContext.Provider
            value={{
                selectedKb,
                setSelectedKb,
                isKbLoading,
                setIsKbLoading,
                ...kbManager,
                ...kbDocManager,
                ...extractionManager,
            }}
        >
            {children}
        </KbContext.Provider>
    );
};
