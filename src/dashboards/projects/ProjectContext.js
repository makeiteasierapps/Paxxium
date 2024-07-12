import { useState, createContext, useContext } from 'react';
import { useDocumentData } from './hooks/useDocumentData';
import { useHighlights } from './hooks/useHighlights';
import { useProjectManager } from './hooks/useProjectManager';
import { useEmbeddedDocs } from './hooks/useEmbeddedDocs';
import { AuthContext } from '../../auth/AuthContext';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
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

    const projectManager = useProjectManager(backendUrl);

    const embeddedDocsManager = useEmbeddedDocs(backendUrl);

    const scrapeUrls = async (
        projectId,
        projectName,
        formattedUrls,
        crawlEntireSite
    ) => {
        const response = await fetch(`${backendUrl}/projects/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'uid': uid,
                'dbName': process.env.REACT_APP_DB_NAME,
            },
            body: JSON.stringify({
                urls: formattedUrls,
                projectName,
                projectId,
                crawlEntireSite,
            }),
        });

        if (!response.ok) throw new Error('Failed to scrape url');

        const data = await response.json();
        const docs = data.docs;
        docs.forEach((doc) => {
            embeddedDocsManager.addEmbeddedDoc(projectId, doc);
        });
    };

    return (
        <ProjectContext.Provider
            value={{
                selectedProject,
                setSelectedProject,
                documentText,
                scrapeUrls,
                documentManager,
                highlightsManager,
                projectManager,
                embeddedDocsManager,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};
