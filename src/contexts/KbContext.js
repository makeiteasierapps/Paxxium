import { useState, createContext, useContext } from 'react';
import { useTextEditorManager } from '../hooks/knowledgeBase/useTextEditorManager';
import { useHighlightManager } from '../hooks/knowledgeBase/useHighlightManager';
import { useKbManager } from '../hooks/knowledgeBase/useKbManager';
import { useKbDocManager } from '../hooks/knowledgeBase/useKbDocManager';
import { useExtractionManager } from '../hooks/knowledgeBase/useExtractionManager';
import { AuthContext } from './AuthContext';
import { useSnackbar } from './SnackbarContext';
export const KbContext = createContext();

export const KbProvider = ({ children }) => {
    const [selectedKb, setSelectedKb] = useState(null);
    const [editorContent, setEditorContent] = useState('');
    const [highlights, setHighlights] = useState([]);
    const [quill, setQuill] = useState(null);
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
        selectedKb,
        editorContent,
        highlights,
    );

    const textEditorManager = useTextEditorManager(
        setEditorContent,
        setHighlights,
        kbDocManager.setCurrentKbDoc
    );

    const highlightsManager = useHighlightManager(
        highlights,
        setHighlights,
        quill
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
                quill,
                setQuill,
                setSelectedKb,
                editorContent,
                setEditorContent,
                textEditorManager,
                highlightsManager,
                highlights,
                setHighlights,
                ...kbManager,
                ...kbDocManager,
                ...extractionManager,
            }}
        >
            {children}
        </KbContext.Provider>
    );
};
