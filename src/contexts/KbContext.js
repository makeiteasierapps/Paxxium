import { useState, createContext, useContext, useEffect } from 'react';
import { useDocumentData } from '../hooks/knowledgeBase/useDocumentData';
import { useHighlights } from '../hooks/knowledgeBase/useHighlights';
import { useKbManager } from '../hooks/knowledgeBase/useKbManager';
import { useEmbeddedDocs } from '../hooks/knowledgeBase/useEmbeddedDocs';
import { AuthContext } from './AuthContext';

export const KbContext = createContext();

export const KbProvider = ({ children }) => {
    const { uid } = useContext(AuthContext);
    const [selectedKb, setSelectedKb] = useState(null);
    const [documentText, setDocumentText] = useState('');
    const [highlights, setHighlights] = useState([]);
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const documentManager = useDocumentData(
        selectedKb,
        documentText,
        setDocumentText,
        highlights,
        setHighlights,
        backendUrl
    );

    const highlightsManager = useHighlights(
        documentText,
        setDocumentText,
        highlights,
        setHighlights
    );

    const kbManager = useKbManager(backendUrl);

    const embeddedDocsManager = useEmbeddedDocs(backendUrl);

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

                console.log(decoder.decode(value));
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
                setSelectedKb,
                documentText,
                scrapeUrl,
                documentManager,
                highlightsManager,
                kbManager,
                ...embeddedDocsManager,
            }}
        >
            {children}
        </KbContext.Provider>
    );
};
