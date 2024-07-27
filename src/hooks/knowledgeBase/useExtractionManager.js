import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
export const useExtractionManager = (backendUrl, setKbDocs) => {
    const { uid } = useContext(AuthContext);
    const scrapeUrl = async (kbId, kbName, url, crawl) => {
        const endpoint = crawl ? 'crawl' : 'scrape';

        try {
            const response = await fetch(`${backendUrl}/kb/extract`, {
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
                    setKbDocs((prevDocs) => ({
                        ...prevDocs,
                        [kbId]: [...prevDocs[kbId], ...data.content],
                    }));
                    return data.content ;
                }
            }
        } catch (error) {
            console.error('Scraping failed:', error);
            throw error;
        }
    };

    const extractFile = async (formData) => {
        try {
            const response = await fetch(`${backendUrl}/kb/extract`, {
                method: 'POST',
                body: formData,
                headers: {
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
                },
            });

            if (!response.ok) throw new Error('Failed to upload file');

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };
    return {
        scrapeUrl,
        extractFile,
    };
};
