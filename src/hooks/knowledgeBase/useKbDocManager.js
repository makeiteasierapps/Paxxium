import { useState, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketProvider';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

export const useKbDocManager = (backendUrl, uid, showSnackbar, selectedKb) => {
    const { socket } = useSocket();
    const [isDocManagerLoading, setIsDocManagerLoading] = useState(true);
    const [kbDocs, setKbDocs] = useState({});
    const kbId = selectedKb ? selectedKb.id : null;

    const convertHTMLtoMarkdown = (content) => {
        console.log('content', content);
        content = content.trim();
        let markdown = turndownService.turndown(content);

        markdown = markdown
            .replace(/\\{2,}n/g, '\n') // Replace double (or more) backslashes followed by 'n' with a single newline
            .replace(/\\\n/g, '\n') // Remove single backslashes before newlines
            .replace(/\n{3,}/g, '\n\n') // Replace 3 or more consecutive newlines with 2
            .replace(/\\_/g, '_') // Remove backslashes before underscores
            .replace(/\\\*/g, '*') // Remove backslashes before asterisks
            .replace(/\\=/g, '=') // Remove backslashes before equal signs
            .replace(/\s+$/gm, '') // Remove trailing spaces from each line
            .trim(); // Trim any leading/trailing whitespace

        return markdown;
    };

    const updateDocumentState = (newDoc) => {
        setKbDocs((prevDocs) => {
            const existingDocs = prevDocs[kbId] || [];
            const updatedDocs = existingDocs.filter(
                (doc) => doc.id !== newDoc.id
            );
            return {
                ...prevDocs,
                [kbId]: [...updatedDocs, newDoc],
            };
        });

        // Update localStorage
        const savedData = JSON.parse(localStorage.getItem('documents')) || {};
        savedData[kbId] = savedData[kbId] || [];
        const updatedDocs = savedData[kbId].filter(
            (doc) => doc.id !== newDoc.id
        );
        savedData[kbId] = [...updatedDocs, newDoc];
        localStorage.setItem('documents', JSON.stringify(savedData));
        console.log('Document updated:', newDoc);
    };

    const handleDocOperation = async (operation, dataToUpdate) => {
        let docData;

        // if (currentKbDoc.type === 'url') {
        //     docData = {
        //         ...currentKbDoc,
        //         kbId,
        //         content: currentKbDoc.content.map((url, index) =>
        //             index === currentUrlIndex
        //                 ? {
        //                       ...url,
        //                       content: convertHTMLtoMarkdown(editorContent),
        //                   }
        //                 : url
        //         ),
        //     };
        // } else {
        //     // PDF type
        //     docData = {
        //         ...currentKbDoc,
        //         kbId,
        //         content: convertHTMLtoMarkdown(editorContent),
        //     };
        // }

        // let updatedDoc;
        // if (operation === 'save') {
        //     // This currently updates the entire set of documents if multiple pages are included.
        //     // it would be better to update the specific document that was changed. That can be tracked
        //     // with the sourceURL located kbDoc.content[currentUrlIndex].metaData
        //     updatedDoc = await saveKbDoc(docData);
        // } else if (operation === 'embed') {
        //     updatedDoc = await embedKbDoc(docData);
        // } else {
        //     throw new Error('Invalid operation');
        // }

        // if (updatedDoc) {
        //     if (updatedDoc.type === 'url') {
        //         console.log(updatedDoc);
        //         updatedDoc.content[currentUrlIndex].content = editorContent;
        //     } else {
        //         updatedDoc.content = editorContent;
        //     }
        //     updateDocumentState(updatedDoc);
        // }

        // return updatedDoc.id;
    };

    const handleSave = (dataToUpdate) =>
        handleDocOperation('save', dataToUpdate);

    const handleEmbed = (currentUrlIndex) =>
        handleDocOperation('embed', currentUrlIndex);

    const embedKbDoc = async (docData) => {
        try {
            setIsDocManagerLoading(true);
            socket.emit('process_document', {
                ...docData,
                dbName: 'paxxium',
                operation: 'embed',
            });

            socket.on('process_started', (data) => {
                console.log('Processing started with ID:', data.process_id);
            });

            socket.on('process_update', (data) => {
                console.log('Process update:', data.status);
            });

            socket.on('process_complete', (data) => {
                showSnackbar('Document embedded successfully', 'success');
                setIsDocManagerLoading(false);
                console.log('Processing completed:', data.kb_doc);
                return data.kb_doc;
            });

            socket.on('process_error', (data) => {
                console.error('Processing error:', data.message);
            });
        } catch (error) {
            console.error('Error embedding text doc:', error);
            showSnackbar('Error embedding text doc', 'error');
            setIsDocManagerLoading(false);
            return null;
        }
    };

    const saveKbDoc = async (docData) => {
        try {
            setIsDocManagerLoading(true);
            socket.emit('process_document', {
                ...docData,
                dbName: 'paxxium',
                operation: 'save',
            });
            showSnackbar('Document saved successfully', 'success');
            setIsDocManagerLoading(false);
        } catch (error) {
            console.error(error);
            showSnackbar('Error saving text doc', 'error');
            setIsDocManagerLoading(false);
            throw error;
        }
    };

    const fetchKbDocs = useCallback(
        async (kbId) => {
            try {
                setIsDocManagerLoading(true);
                const response = await fetch(
                    `${backendUrl}/kb/${kbId}/documents`,
                    {
                        method: 'GET',
                        headers: {
                            uid: uid,
                            dbName: process.env.REACT_APP_DB_NAME,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch documents');
                }

                const data = await response.json();
                setIsDocManagerLoading(false);
                setKbDocs((prevDocuments) => ({
                    ...prevDocuments,
                    [kbId]: data.documents,
                }));
            } catch (error) {
                showSnackbar('Error fetching documents', 'error');
                setIsDocManagerLoading(false);
                throw error;
            }
        },
        [backendUrl, showSnackbar, uid]
    );

    const deleteKbDoc = async (kbId, docId) => {
        try {
            setIsDocManagerLoading(true);
            const response = await fetch(`${backendUrl}/kb/${kbId}/documents`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ docId }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            setIsDocManagerLoading(false);
            setKbDocs((prevDocs) => {
                const updatedKbDocs = prevDocs[kbId].filter(
                    (doc) => doc.id !== docId
                );
                return {
                    ...prevDocs,
                    [kbId]: updatedKbDocs,
                };
            });

            const savedData =
                JSON.parse(localStorage.getItem('documents')) || {};
            const updatedKbDocs =
                savedData[kbId]?.filter((doc) => doc.id !== docId) || [];
            localStorage.setItem(
                'documents',
                JSON.stringify({ ...savedData, [kbId]: updatedKbDocs })
            );
        } catch (error) {
            showSnackbar('Error deleting document', 'error');
            setIsDocManagerLoading(false);
            throw error;
        }
    };

    return {
        kbDocs,
        setKbDocs,
        fetchKbDocs,
        deleteKbDoc,
        handleSave,
        handleEmbed,
        isDocManagerLoading,
        convertHTMLtoMarkdown,
    };
};
