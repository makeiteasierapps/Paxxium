import { useState, createContext, useContext, useEffect } from 'react';

import { AuthContext } from '../../auth/AuthContext';
import { useDocumentData } from './hooks/useDocumentData';
import { useHighlights } from './hooks/useHighlights';
import { useProjectManager } from './hooks/useProjectManager';
import { useEmbeddedDocs } from './hooks/useEmbeddedDocs';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [documentText, setDocumentText] = useState('');
    const [highlights, setHighlights] = useState([]);

    const { idToken } = useContext(AuthContext);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:50003'
            : process.env.REACT_APP_BACKEND_URL_PROD;

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
                Authorization: idToken,
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

    useEffect(() => {
        if (!idToken) return;
        projectManager.fetchProjects();
    }, [idToken]);

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
