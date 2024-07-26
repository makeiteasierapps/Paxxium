import { useState, createContext, useContext } from 'react';
import { useTextEditorManager } from '../hooks/knowledgeBase/useTextEditorManager';
import { useHighlightManager } from '../hooks/knowledgeBase/useHighlightManager';
import { useKbManager } from '../hooks/knowledgeBase/useKbManager';
import { useEmbeddedDocs } from '../hooks/knowledgeBase/useEmbeddedDocs';
import { AuthContext } from './AuthContext';

export const KbContext = createContext();

export const KbProvider = ({ children }) => {
    const { uid } = useContext(AuthContext);
    const [selectedKb, setSelectedKb] = useState(null);
    const [editorContent, setEditorContent] = useState('');
    const [highlights, setHighlights] = useState([]);
    const [quill, setQuill] = useState(null);
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const embeddedDocsManager = useEmbeddedDocs(backendUrl);

    const textEditorManager = useTextEditorManager(
        selectedKb,
        editorContent,
        setEditorContent,
        highlights,
        setHighlights,
        backendUrl,
        embeddedDocsManager.setEmbeddedDocs
    );

    const highlightsManager = useHighlightManager(
        highlights,
        setHighlights,
        quill
    );

    const kbManager = useKbManager(backendUrl);

    const scrapeUrl = async (kbId, kbName, url, crawl) => {
        const endpoint = crawl ? 'crawl' : 'scrape';

        try {
            const response = await fetch(`${backendUrl}/kb/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({
                    kbId,
                    kbName,
                    url,
                    endpoint,
                    type: 'url',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to scrape and add document');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const data = JSON.parse(decoder.decode(value));

                if (data.status === 'completed') {
                    embeddedDocsManager.setEmbeddedDocs((prevDocs) => ({
                        ...prevDocs,
                        [kbId]: [...prevDocs[kbId], ...data.content],
                    }));
                }
            }
        } catch (error) {
            console.error('Scraping failed:', error);
            throw error;
        }
    };

    return (
        <KbContext.Provider
            value={{
                selectedKb,
                quill,
                setQuill,
                setSelectedKb,
                editorContent,
                setEditorContent,
                scrapeUrl,
                textEditorManager,
                highlightsManager,
                highlights,
                setHighlights,
                kbManager,
                ...embeddedDocsManager,
            }}
        >
            {children}
        </KbContext.Provider>
    );
};
