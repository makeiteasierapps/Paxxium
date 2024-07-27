import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import TurndownService from 'turndown';
import { useSnackbar } from '../../contexts/SnackbarContext';

const turndownService = new TurndownService();

export const useKbDocManager = (
    backendUrl,
    selectedKb,
    editorContent,
    highlights
) => {
    const { uid } = useContext(AuthContext);
    const { showSnackbar } = useSnackbar();
    const [kbDocs, setKbDocs] = useState({});
    const [currentKbDoc, setCurrentKbDoc] = useState({});
    const kbId = selectedKb ? selectedKb.id : null;

    const convertHTMLtoMarkdown = (content) => {
        let markdown = turndownService.turndown(content);

        // Clean the Markdown content
        markdown = markdown
            .replace(/\n\s*\n/g, '\n\n') // Reduce multiple newlines to maximum two
            .trim(); // Remove leading and trailing whitespace

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

        setCurrentKbDoc(newDoc);
    };

    const handleDocOperation = async (operation) => {
        const cleanContent = convertHTMLtoMarkdown(editorContent);
        const docData = {
            ...currentKbDoc,
            kbId,
            content: cleanContent,
            highlights,
        };

        let updatedDoc;
        if (operation === 'save') {
            updatedDoc = await saveKbDoc(docData);
        } else if (operation === 'embed') {
            updatedDoc = await embedKbDoc(docData);
        } else {
            throw new Error('Invalid operation');
        }

        if (updatedDoc) {
            updatedDoc.content = editorContent;
            updateDocumentState(updatedDoc);
        }

        return updatedDoc.id;
    };

    const handleSave = () => handleDocOperation('save');
    const handleEmbed = () => handleDocOperation('embed');

    const embedKbDoc = async (docData) => {
        try {
            const response = await fetch(`${backendUrl}/kb/embed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify(docData),
            });

            if (!response.ok) {
                throw new Error('Failed to embed text doc');
            }

            const data = await response.json();
            console.log(data.kb_doc);
            showSnackbar('Document embedded successfully', 'success');
            return data.kb_doc;
        } catch (error) {
            console.error('Error embedding text doc:', error);
            showSnackbar('Error embedding text doc', 'error');
            return null;
        }
    };

    const saveKbDoc = async (docData) => {
        try {
            const response = await fetch(`${backendUrl}/kb/save_doc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify(docData),
            });

            if (!response.ok) {
                throw new Error('Failed to save text doc');
            }

            const data = await response.json();
            showSnackbar('Document saved successfully', 'success');
            return data.kb_doc;
        } catch (error) {
            console.error(error);
            showSnackbar('Error saving text doc', 'error');
        }
    };

    const fetchKbDocs = useCallback(
        async (kbId) => {
            try {
                const response = await fetch(`${backendUrl}/kb/documents`, {
                    method: 'GET',
                    headers: {
                        'Kb-ID': kbId,
                        uid: uid,
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch documents');
                }

                const data = await response.json();
                setKbDocs((prevDocuments) => ({
                    ...prevDocuments,
                    [kbId]: data.documents,
                }));
            } catch (error) {
                showSnackbar('Error fetching documents', 'error');
            }
        },
        [backendUrl, showSnackbar, uid]
    );

    const deleteKbDoc = async (kbId, docId) => {
        try {
            const response = await fetch(`${backendUrl}/kb/documents`, {
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
        }
    };

    return {
        kbDocs,
        setKbDocs,
        fetchKbDocs,
        deleteKbDoc,
        handleSave,
        handleEmbed,
        currentKbDoc,
        setCurrentKbDoc,
    };
};
