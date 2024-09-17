export const useExtractionManager = (
    backendUrl,
    uid,
    showSnackbar,
    setKbDocs
) => {
    const scrapeUrl = async (kbId, url, crawl) => {
        const endpoint = crawl ? 'crawl' : 'scrape';
        try {
            const response = await fetch(`${backendUrl}/kb/${kbId}/extract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({
                    url,
                    endpoint,
                    type: 'url',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to scrape and add document');
            }

            const data = await response.json();
            console.log('Received data:', data);

            // Update the state with the new document
            setKbDocs((prevDocs) => ({
                ...prevDocs,
                [kbId]: [...(prevDocs[kbId] || []), data],
            }));

            return data;
        } catch (error) {
            console.error('Scraping failed:', error);
            throw error;
        }
    };

    const extractFile = async (formData, kbId) => {
        try {
            const response = await fetch(`${backendUrl}/kb/${kbId}/extract`, {
                method: 'POST',
                body: formData,
                headers: {
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
                },
            });

            if (!response.ok) throw new Error('Failed to upload file');

            const data = await response.json();

            setKbDocs((prevDocs) => ({
                ...prevDocs,
                [kbId]: [...prevDocs[kbId], data],
            }));
            return data;
        } catch (error) {
            console.error('Error uploading file:', error);
            showSnackbar('Error uploading file', 'error');
            throw error;
        }
    };
    return {
        scrapeUrl,
        extractFile,
    };
};
