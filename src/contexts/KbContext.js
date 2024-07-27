import { useState, createContext, useContext } from 'react';
import { useTextEditorManager } from '../hooks/knowledgeBase/useTextEditorManager';
import { useHighlightManager } from '../hooks/knowledgeBase/useHighlightManager';
import { useKbManager } from '../hooks/knowledgeBase/useKbManager';
import { useKbDocManager } from '../hooks/knowledgeBase/useKbDocManager';
import { useExtractionManager } from '../hooks/knowledgeBase/useExtractionManager';
import { SnackbarContext } from './SnackbarContext';

export const KbContext = createContext();

export const KbProvider = ({ children }) => {
    const { showSnackbar } = useContext(SnackbarContext);
    const [selectedKb, setSelectedKb] = useState(null);
    const [editorContent, setEditorContent] = useState('');
    const [highlights, setHighlights] = useState([]);
    const [quill, setQuill] = useState(null);
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const kbDocManager = useKbDocManager(
        backendUrl,
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

    const kbManager = useKbManager(backendUrl);

    const extractionManager = useExtractionManager(
        backendUrl,
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
                kbManager,
                ...kbDocManager,
                ...extractionManager,
            }}
        >
            {children}
        </KbContext.Provider>
    );
};
