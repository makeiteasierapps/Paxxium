import { useState, createContext, useContext } from 'react';
import { useDocumentData } from '../hooks/knowledgeBase/useDocumentData';
import { useHighlights } from '../hooks/knowledgeBase/useHighlights';
import { useKbManager } from '../hooks/knowledgeBase/useKbManager';
import { useEmbeddedDocs } from '../hooks/knowledgeBase/useEmbeddedDocs';
import { AuthContext } from './AuthContext';

export const KbContext = createContext();

export const KbProvider = ({ children }) => {
    const { uid } = useContext(AuthContext);
    const [selectedProject, setSelectedProject] = useState(null);
    const [documentText, setDocumentText] = useState('');
    const [highlights, setHighlights] = useState([]);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const documentManager = useDocumentData(
        selectedProject,
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

    const projectManager = useKbManager(backendUrl);

    const embeddedDocsManager = useEmbeddedDocs(backendUrl);

    const scrapeUrl = async (projectId, projectName, url, crawl) => {
        const endpoint = crawl ? 'crawl' : 'scrape';
        const params = {
            url,
            pageOptions: {
                onlyMainContent: true,
            },
        };
        const firecrawlResponse = await fetch(
            `${process.env.REACT_APP_FIRECRAWL_URL}/${endpoint}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            }
        );

        if (!firecrawlResponse.ok) throw new Error('Failed to scrape url');

        const firecrawlData = await firecrawlResponse.json();
        let urlDocument;
        if (firecrawlData.jobId) {
            const jobId = firecrawlData.jobId;
            // Poll for job status
            const checkJobStatus = async (jobId) => {
                const firecrawlResponse = await fetch(
                    `${process.env.REACT_APP_FIRECRAWL_URL}/crawl/status/${jobId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!firecrawlResponse.ok)
                    throw new Error('Failed to check job status');

                const statusData = await firecrawlResponse.json();
                return statusData;
            };

            // Polling mechanism
            let jobStatus;
            const interval = setInterval(async () => {
                jobStatus = await checkJobStatus(jobId);
                if (jobStatus.status === 'completed') {
                    clearInterval(interval);
                    // Handle the completed job data
                    console.log('Crawl completed:', jobStatus.data);
                    urlDocument = {
                        content: jobStatus.data,
                    };
                } else if (jobStatus.status === 'failed') {
                    clearInterval(interval);
                    throw new Error('Crawl job failed');
                }
            }, 5000);

            await new Promise((resolve) => {
                const checkCompletion = setInterval(() => {
                    if (jobStatus && jobStatus.status === 'completed') {
                        clearInterval(checkCompletion);
                        resolve();
                    }
                }, 500); 
            });
        } else {
            urlDocument = {
                content: [
                    {
                        markdown: firecrawlData.data.markdown,
                        metadata: firecrawlData.data.metadata,
                    },
                ],
            };
        }

        const response = await fetch(`${backendUrl}/projects/documents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                uid: uid,
                dbName: process.env.REACT_APP_DB_NAME,
            },
            body: JSON.stringify({
                projectId,
                projectName,
                document: urlDocument,
                type: 'url',
            }),
        });

        if (!response.ok) throw new Error('Failed to add document');

        const data = await response.json();
        console.log(data.message);
    };

    return (
        <KbContext.Provider
            value={{
                selectedProject,
                setSelectedProject,
                documentText,
                scrapeUrl,
                documentManager,
                highlightsManager,
                projectManager,
                ...embeddedDocsManager,
            }}
        >
            {children}
        </KbContext.Provider>
    );
};
